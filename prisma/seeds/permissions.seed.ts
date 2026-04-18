import type { PrismaClient } from '@prisma/client';

type PermissionSeed = {
  key: string;
  module: string;
  action: string;
  description: string;
};

const FOUNDATION_PERMISSIONS: PermissionSeed[] = [
  {
    key: 'core:organization:read',
    module: 'core',
    action: 'organization.read',
    description: 'Consultar información de la organización.',
  },
  {
    key: 'core:organization:update',
    module: 'core',
    action: 'organization.update',
    description: 'Actualizar información de la organización.',
  },
  {
    key: 'auth:user:read',
    module: 'auth',
    action: 'user.read',
    description: 'Consultar usuarios del tenant.',
  },
  {
    key: 'auth:user:write',
    module: 'auth',
    action: 'user.write',
    description: 'Crear y actualizar usuarios del tenant.',
  },
  {
    key: 'auth:role:read',
    module: 'auth',
    action: 'role.read',
    description: 'Consultar roles configurados.',
  },
  {
    key: 'auth:role:write',
    module: 'auth',
    action: 'role.write',
    description: 'Crear y actualizar roles.',
  },
  {
    key: 'auth:permission:read',
    module: 'auth',
    action: 'permission.read',
    description: 'Consultar catálogo de permisos.',
  },
  {
    key: 'settings:read',
    module: 'settings',
    action: 'read',
    description: 'Consultar configuración global y por organización.',
  },
  {
    key: 'settings:write',
    module: 'settings',
    action: 'write',
    description: 'Actualizar configuración global y por organización.',
  },
  {
    key: 'feature_flags:read',
    module: 'feature_flags',
    action: 'read',
    description: 'Consultar estado de feature flags.',
  },
  {
    key: 'feature_flags:write',
    module: 'feature_flags',
    action: 'write',
    description: 'Modificar feature flags.',
  },
  {
    key: 'audit:read',
    module: 'audit',
    action: 'read',
    description: 'Consultar bitácora de auditoría.',
  },
  {
    key: 'sync:resolve',
    module: 'sync',
    action: 'resolve',
    description: 'Resolver conflictos en Sync Center.',
  },
  {
    key: 'finops:bank_account:read',
    module: 'finops',
    action: 'bank_account.read',
    description: 'Consultar cuentas bancarias y saldos.',
  },
  {
    key: 'finops:bank_account:write',
    module: 'finops',
    action: 'bank_account.write',
    description: 'Crear, actualizar o eliminar cuentas bancarias.',
  },
  {
    key: 'finops:financial_movement:read',
    module: 'finops',
    action: 'financial_movement.read',
    description: 'Consultar movimientos financieros.',
  },
  {
    key: 'finops:financial_movement:write',
    module: 'finops',
    action: 'financial_movement.write',
    description: 'Crear, actualizar o eliminar movimientos financieros.',
  },
  {
    key: 'finops:transfer:read',
    module: 'finops',
    action: 'transfer.read',
    description: 'Consultar transferencias internas.',
  },
  {
    key: 'finops:transfer:write',
    module: 'finops',
    action: 'transfer.write',
    description: 'Crear, actualizar o eliminar transferencias internas.',
  },
  {
    key: 'finops:reconciliation:read',
    module: 'finops',
    action: 'reconciliation.read',
    description: 'Consultar sesiones y partidas de conciliación.',
  },
  {
    key: 'finops:reconciliation:write',
    module: 'finops',
    action: 'reconciliation.write',
    description: 'Ejecutar conciliación, cierre y aprobación de sesiones.',
  },
  {
    key: 'finops:balance_snapshot:read',
    module: 'finops',
    action: 'balance_snapshot.read',
    description: 'Consultar snapshots de saldo por cuenta.',
  },
  {
    key: 'finops:receivable:read',
    module: 'finops',
    action: 'receivable.read',
    description: 'Consultar cuentas por cobrar simplificadas.',
  },
  {
    key: 'finops:receivable:write',
    module: 'finops',
    action: 'receivable.write',
    description: 'Crear, actualizar o eliminar cuentas por cobrar simplificadas.',
  },
  {
    key: 'finops:payable:read',
    module: 'finops',
    action: 'payable.read',
    description: 'Consultar cuentas por pagar simplificadas.',
  },
  {
    key: 'finops:payable:write',
    module: 'finops',
    action: 'payable.write',
    description: 'Crear, actualizar o eliminar cuentas por pagar simplificadas.',
  },
  {
    key: 'finops:attachment:read',
    module: 'finops',
    action: 'attachment.read',
    description: 'Consultar adjuntos de operaciones financieras.',
  },
  {
    key: 'finops:attachment:write',
    module: 'finops',
    action: 'attachment.write',
    description: 'Subir y vincular adjuntos en operaciones financieras.',
  },
];

const ROLE_PERMISSION_KEYS: Record<string, string[]> = {
  admin: FOUNDATION_PERMISSIONS.map((permission) => permission.key),
  tesorero: [
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
  ],
  auditor: [
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
  ],
};

export async function seedPermissionsAndRoleMapping(
  prisma: PrismaClient,
  organizationId: string,
): Promise<void> {
  console.log('[seeds][permissions] Upsert de permisos foundation...');

  for (const permission of FOUNDATION_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        module: permission.module,
        action: permission.action,
        description: permission.description,
        isActive: true,
      },
      create: {
        key: permission.key,
        module: permission.module,
        action: permission.action,
        description: permission.description,
        isActive: true,
      },
    });
  }

  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      where: {
        organizationId,
        name: { in: Object.keys(ROLE_PERMISSION_KEYS) },
      },
      select: { id: true, name: true },
    }),
    prisma.permission.findMany({
      where: {
        key: { in: FOUNDATION_PERMISSIONS.map((permission) => permission.key) },
      },
      select: { id: true, key: true },
    }),
  ]);

  const roleByName = new Map(roles.map((role) => [role.name, role.id]));
  const permissionByKey = new Map(permissions.map((permission) => [permission.key, permission.id]));

  for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSION_KEYS)) {
    const roleId = roleByName.get(roleName);

    if (!roleId) {
      throw new Error(`[seeds][permissions] Rol no encontrado para mapping: ${roleName}`);
    }

    for (const permissionKey of permissionKeys) {
      const permissionId = permissionByKey.get(permissionKey);

      if (!permissionId) {
        throw new Error(`[seeds][permissions] Permiso no encontrado para mapping: ${permissionKey}`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }

  console.log(`[seeds][permissions] OK (${FOUNDATION_PERMISSIONS.length} permisos).`);
}
