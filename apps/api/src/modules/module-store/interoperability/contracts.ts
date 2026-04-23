type CrossModuleAccessMode = 'read' | 'write';

export interface ModuleCrossAccessRule {
  targetModuleKey: string;
  entities: string[];
  mode: CrossModuleAccessMode;
  reason: string;
}

export interface ModuleDomainEventContract {
  eventKey: string;
  version: string;
  publisherModuleKey: string;
  subscribers: string[];
  payloadSchemaRef: string;
}

export interface ModuleInteroperabilityContract {
  moduleKey: string;
  ownedEntities: string[];
  crossModuleAccess: ModuleCrossAccessRule[];
  domainEvents: ModuleDomainEventContract[];
}

const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

export const MODULE_INTEROPERABILITY_CONTRACTS: Record<string, ModuleInteroperabilityContract> =
  Object.freeze({
    'core-platform': {
      moduleKey: 'core-platform',
      ownedEntities: [
        'organization',
        'branch',
        'user',
        'role',
        'permission',
        'user_role',
        'role_permission',
        'setting',
        'feature_flag',
        'attachment',
      ],
      crossModuleAccess: [],
      domainEvents: [
        {
          eventKey: 'core.user.created',
          version: '1.0.0',
          publisherModuleKey: 'core-platform',
          subscribers: ['financial-operations', 'hr'],
          payloadSchemaRef: 'schemas/events/core.user.created.v1.json',
        },
      ],
    },
    'financial-operations': {
      moduleKey: 'financial-operations',
      ownedEntities: [
        'bank_account',
        'financial_movement',
        'financial_transfer',
        'reconciliation_session',
        'reconciliation_item',
        'balance_snapshot',
        'receivable_lite',
        'payable_lite',
      ],
      crossModuleAccess: [
        {
          targetModuleKey: 'core-platform',
          entities: ['organization', 'branch', 'user'],
          mode: 'read',
          reason: 'Resolver contexto organizacional y usuarios operadores.',
        },
      ],
      domainEvents: [
        {
          eventKey: 'finops.movement.posted',
          version: '1.0.0',
          publisherModuleKey: 'financial-operations',
          subscribers: ['accounting'],
          payloadSchemaRef: 'schemas/events/finops.movement.posted.v1.json',
        },
        {
          eventKey: 'finops.transfer.posted',
          version: '1.0.0',
          publisherModuleKey: 'financial-operations',
          subscribers: ['accounting'],
          payloadSchemaRef: 'schemas/events/finops.transfer.posted.v1.json',
        },
      ],
    },
    accounting: {
      moduleKey: 'accounting',
      ownedEntities: [
        'chart_of_account',
        'posting_rule',
        'fiscal_period',
        'journal_entry',
        'journal_entry_line',
        'accounting_posting_error',
      ],
      crossModuleAccess: [
        {
          targetModuleKey: 'core-platform',
          entities: ['organization'],
          mode: 'read',
          reason: 'Usar contexto organizacional para asientos y periodos.',
        },
        {
          targetModuleKey: 'financial-operations',
          entities: ['financial_movement', 'financial_transfer'],
          mode: 'read',
          reason: 'Consumir movimientos publicados para generar postings contables.',
        },
      ],
      domainEvents: [
        {
          eventKey: 'accounting.entry.posted',
          version: '1.0.0',
          publisherModuleKey: 'accounting',
          subscribers: ['core-platform'],
          payloadSchemaRef: 'schemas/events/accounting.entry.posted.v1.json',
        },
      ],
    },
    hr: {
      moduleKey: 'hr',
      ownedEntities: [
        'department',
        'position',
        'employee',
        'contract',
        'leave_request',
        'leave_balance',
        'employee_document',
      ],
      crossModuleAccess: [
        {
          targetModuleKey: 'core-platform',
          entities: ['organization', 'branch', 'user', 'attachment'],
          mode: 'read',
          reason: 'Relacionar empleados, sucursales y documentos.',
        },
      ],
      domainEvents: [
        {
          eventKey: 'hr.employee.created',
          version: '1.0.0',
          publisherModuleKey: 'hr',
          subscribers: ['core-platform'],
          payloadSchemaRef: 'schemas/events/hr.employee.created.v1.json',
        },
      ],
    },
  });

function assertValidContractShape(contract: ModuleInteroperabilityContract): void {
  if (!contract.moduleKey.trim()) {
    throw new Error('Contract moduleKey is required.');
  }
  if (contract.ownedEntities.length === 0) {
    throw new Error(`Contract "${contract.moduleKey}" must define at least one owned entity.`);
  }
  for (const event of contract.domainEvents) {
    if (!SEMVER_REGEX.test(event.version)) {
      throw new Error(
        `Event "${event.eventKey}" in "${contract.moduleKey}" must use semantic version x.y.z.`,
      );
    }
    if (event.publisherModuleKey !== contract.moduleKey) {
      throw new Error(
        `Event "${event.eventKey}" publisher must match contract moduleKey "${contract.moduleKey}".`,
      );
    }
  }
}

export function assertValidInteroperabilityContracts(): void {
  const moduleKeys = Object.keys(MODULE_INTEROPERABILITY_CONTRACTS);
  const ownership = new Map<string, string>();

  for (const [key, contract] of Object.entries(MODULE_INTEROPERABILITY_CONTRACTS)) {
    if (contract.moduleKey !== key) {
      throw new Error(`Contract key "${key}" must match moduleKey "${contract.moduleKey}".`);
    }
    assertValidContractShape(contract);

    for (const entity of contract.ownedEntities) {
      const owner = ownership.get(entity);
      if (owner) {
        throw new Error(`Entity "${entity}" has duplicated owners: "${owner}" and "${key}".`);
      }
      ownership.set(entity, key);
    }
  }

  for (const contract of Object.values(MODULE_INTEROPERABILITY_CONTRACTS)) {
    for (const accessRule of contract.crossModuleAccess) {
      if (!moduleKeys.includes(accessRule.targetModuleKey)) {
        throw new Error(
          `Module "${contract.moduleKey}" references unknown target module "${accessRule.targetModuleKey}".`,
        );
      }
      const targetContract = MODULE_INTEROPERABILITY_CONTRACTS[accessRule.targetModuleKey];
      for (const entity of accessRule.entities) {
        if (!targetContract.ownedEntities.includes(entity)) {
          throw new Error(
            `Access rule "${contract.moduleKey}" -> "${accessRule.targetModuleKey}" includes non-owned entity "${entity}".`,
          );
        }
      }
    }
  }
}

export function getModuleInteroperabilityContract(
  moduleKey: string,
): ModuleInteroperabilityContract | null {
  return MODULE_INTEROPERABILITY_CONTRACTS[moduleKey] ?? null;
}
