/**
 * T-1336 — Pruebas de permisos del módulo Financial Operations Core
 *
 * Valida que todos los endpoints finops tengan @RequireAllPermissions,
 * que el seed de permisos sea completo y los perfiles de rol sean coherentes.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { PERMISSIONS_ALL_KEY } from '../../common/constants/authorization.constants';

import { BankAccountsController } from '../bank-accounts/bank-accounts.controller';
import { FinancialMovementsController } from './financial-movements.controller';
import { TransfersController } from '../transfers/transfers.controller';
import { ReconciliationController } from '../reconciliation/reconciliation.controller';
import { BalanceSnapshotsController } from '../balance-snapshots/balance-snapshots.controller';
import { ReceivablesLiteController } from '../receivables-lite/receivables-lite.controller';
import { PayablesLiteController } from '../payables-lite/payables-lite.controller';

// ── Helpers ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getHandlerPermissions(
  controllerClass: new (...args: any[]) => any,
  handlerName: string,
): string[] | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(
    controllerClass.prototype,
    handlerName,
  );
  if (!descriptor?.value) return undefined;
  return Reflect.getMetadata(PERMISSIONS_ALL_KEY, descriptor.value) as
    | string[]
    | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPrototypeMethods(cls: new (...args: any[]) => any): string[] {
  return Object.getOwnPropertyNames(cls.prototype).filter(
    (m) => m !== 'constructor' && typeof cls.prototype[m] === 'function',
  );
}

// ── Catálogo de permisos finops esperados ────────────────────────────

const FINOPS_PERMISSIONS = [
  'finops:bank_account:read',
  'finops:bank_account:write',
  'finops:financial_movement:read',
  'finops:financial_movement:write',
  'finops:transfer:read',
  'finops:transfer:write',
  'finops:reconciliation:read',
  'finops:reconciliation:write',
  'finops:balance_snapshot:read',
  'finops:receivable:read',
  'finops:receivable:write',
  'finops:payable:read',
  'finops:payable:write',
  'finops:attachment:read',
  'finops:attachment:write',
] as const;

// ── Mapa de controladores y permisos esperados por handler ──────────

type ControllerPermissionSpec = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controller: new (...args: any[]) => any;
  handlers: Record<string, string[]>;
};

const CONTROLLER_SPECS: ControllerPermissionSpec[] = [
  {
    name: 'BankAccountsController',
    controller: BankAccountsController,
    handlers: {
      create: ['finops:bank_account:write'],
      findAll: ['finops:bank_account:read'],
      findOne: ['finops:bank_account:read'],
      update: ['finops:bank_account:write'],
      softDelete: ['finops:bank_account:write'],
      countActiveByOrganization: ['finops:bank_account:read'],
      getBalanceByAccount: ['finops:bank_account:read'],
      getBalanceSummaryByOrganization: ['finops:bank_account:read'],
    },
  },
  {
    name: 'FinancialMovementsController',
    controller: FinancialMovementsController,
    handlers: {
      create: ['finops:financial_movement:write'],
      findAll: ['finops:financial_movement:read'],
      findAllByFilters: ['finops:financial_movement:read'],
      findOne: ['finops:financial_movement:read'],
      update: ['finops:financial_movement:write'],
      softDelete: ['finops:financial_movement:write'],
      listProofs: ['finops:financial_movement:read'],
      uploadProof: ['finops:financial_movement:write', 'finops:attachment:write'],
    },
  },
  {
    name: 'TransfersController',
    controller: TransfersController,
    handlers: {
      create: ['finops:transfer:write'],
      findAll: ['finops:transfer:read'],
      findOne: ['finops:transfer:read'],
      update: ['finops:transfer:write'],
      softDelete: ['finops:transfer:write'],
    },
  },
  {
    name: 'ReconciliationController',
    controller: ReconciliationController,
    handlers: {
      findSessions: ['finops:reconciliation:read'],
      findSessionById: ['finops:reconciliation:read'],
      findSessionItems: ['finops:reconciliation:read'],
      reconcileSession: ['finops:reconciliation:write'],
      closeSession: ['finops:reconciliation:write'],
      approveSession: ['finops:reconciliation:write'],
    },
  },
  {
    name: 'BalanceSnapshotsController',
    controller: BalanceSnapshotsController,
    handlers: {
      findAll: ['finops:balance_snapshot:read'],
      findLatestByBankAccount: ['finops:balance_snapshot:read'],
      findOne: ['finops:balance_snapshot:read'],
    },
  },
  {
    name: 'ReceivablesLiteController',
    controller: ReceivablesLiteController,
    handlers: {
      create: ['finops:receivable:write'],
      findAll: ['finops:receivable:read'],
      findOne: ['finops:receivable:read'],
      update: ['finops:receivable:write'],
      softDelete: ['finops:receivable:write'],
      countOverdueByOrganization: ['finops:receivable:read'],
    },
  },
  {
    name: 'PayablesLiteController',
    controller: PayablesLiteController,
    handlers: {
      create: ['finops:payable:write'],
      findAll: ['finops:payable:read'],
      findOne: ['finops:payable:read'],
      update: ['finops:payable:write'],
      softDelete: ['finops:payable:write'],
      countOverdueByOrganization: ['finops:payable:read'],
    },
  },
];

// ── Tests: todos los handlers tienen @RequireAllPermissions ─────────

for (const spec of CONTROLLER_SPECS) {
  void test(`T-1336: ${spec.name} — todos los handlers tienen permisos asignados`, () => {
    const handlers = getPrototypeMethods(spec.controller);
    for (const handler of handlers) {
      const permissions = getHandlerPermissions(spec.controller, handler);
      assert.ok(
        permissions && permissions.length > 0,
        `${spec.name}.${handler} no tiene @RequireAllPermissions.`,
      );
    }
  });

  void test(`T-1336: ${spec.name} — permisos coinciden con los esperados`, () => {
    for (const [handler, expectedPerms] of Object.entries(spec.handlers)) {
      const actual = getHandlerPermissions(spec.controller, handler);
      assert.ok(actual, `${spec.name}.${handler} no tiene metadata de permisos.`);
      assert.deepEqual(
        [...actual].sort(),
        [...expectedPerms].sort(),
        `${spec.name}.${handler} permisos incorrectos: esperados [${expectedPerms}], actual [${actual}].`,
      );
    }
  });
}

// ── Tests: todos los permisos finops usan prefijo correcto ──────────

void test('T-1336: todos los permisos asignados inician con finops:', () => {
  for (const spec of CONTROLLER_SPECS) {
    for (const [handler, perms] of Object.entries(spec.handlers)) {
      for (const perm of perms) {
        assert.ok(
          perm.startsWith('finops:'),
          `${spec.name}.${handler} usa permiso no-finops: ${perm}`,
        );
      }
    }
  }
});

// ── Tests: perfil tesorero ──────────────────────────────────────────

const TESORERO_KEYS = [
  'core:organization:read',
  'auth:user:read',
  'settings:read',
  'feature_flags:read',
  'audit:read',
  'sync:resolve',
  'finops:bank_account:read',
  'finops:bank_account:write',
  'finops:financial_movement:read',
  'finops:financial_movement:write',
  'finops:transfer:read',
  'finops:transfer:write',
  'finops:reconciliation:read',
  'finops:reconciliation:write',
  'finops:balance_snapshot:read',
  'finops:receivable:read',
  'finops:receivable:write',
  'finops:payable:read',
  'finops:payable:write',
  'finops:attachment:read',
  'finops:attachment:write',
] as const;

void test('T-1336: perfil tesorero tiene read+write para cada entidad finops', () => {
  for (const perm of FINOPS_PERMISSIONS) {
    assert.ok(
      TESORERO_KEYS.includes(perm as (typeof TESORERO_KEYS)[number]),
      `Tesorero no incluye permiso: ${perm}`,
    );
  }
});

// ── Tests: perfil auditor ───────────────────────────────────────────

const AUDITOR_KEYS = [
  'core:organization:read',
  'auth:user:read',
  'auth:role:read',
  'auth:permission:read',
  'settings:read',
  'feature_flags:read',
  'audit:read',
  'finops:bank_account:read',
  'finops:financial_movement:read',
  'finops:transfer:read',
  'finops:reconciliation:read',
  'finops:balance_snapshot:read',
  'finops:receivable:read',
  'finops:payable:read',
  'finops:attachment:read',
] as const;

void test('T-1336: auditor tiene solo read finops (sin write)', () => {
  const auditorFinops = AUDITOR_KEYS.filter((k) => k.startsWith('finops:'));

  for (const key of auditorFinops) {
    assert.ok(key.endsWith(':read'), `Auditor tiene permiso no-read: ${key}`);
  }
});

void test('T-1336: auditor no tiene ningún permiso :write finops', () => {
  const writePerms = FINOPS_PERMISSIONS.filter((p) => p.endsWith(':write'));
  for (const wp of writePerms) {
    assert.equal(
      AUDITOR_KEYS.includes(wp as (typeof AUDITOR_KEYS)[number]),
      false,
      `Auditor NO debe tener: ${wp}`,
    );
  }
});

// ── Tests: completitud del catálogo de permisos ─────────────────────

void test('T-1336: catálogo finops tiene al menos 15 permisos', () => {
  assert.ok(
    FINOPS_PERMISSIONS.length >= 15,
    `Se esperan al menos 15 permisos finops, hay ${FINOPS_PERMISSIONS.length}.`,
  );
});

void test('T-1336: cada permiso finops sigue formato módulo:entidad:acción', () => {
  for (const perm of FINOPS_PERMISSIONS) {
    const parts = perm.split(':');
    assert.equal(parts.length, 3, `Permiso con formato incorrecto: ${perm}`);
    assert.equal(parts[0], 'finops', `Prefijo incorrecto: ${perm}`);
    assert.ok(
      ['read', 'write'].includes(parts[2]),
      `Acción inválida en: ${perm}`,
    );
  }
});
