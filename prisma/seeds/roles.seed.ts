import type { PrismaClient } from '@prisma/client';

export const FOUNDATION_ROLES: Array<{ name: string; description: string; level: number }> = [
  {
    name: 'owner',
    description: 'Propietario del tenant con control total y gobierno de la instancia.',
    level: 120,
  },
  {
    name: 'admin',
    description: 'Acceso administrativo completo para configuracion y operacion.',
    level: 100,
  },
  {
    name: 'tesorero',
    description: 'Perfil operativo enfocado en tesoreria y conciliacion.',
    level: 50,
  },
  {
    name: 'auditor',
    description: 'Perfil de consulta y auditoria con permisos de solo lectura.',
    level: 50,
  },
];

export async function seedRoles(prisma: PrismaClient, organizationId: string): Promise<void> {
  console.log('[seeds][roles] Upsert de roles foundation...');

  for (const role of FOUNDATION_ROLES) {
    await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId,
          name: role.name,
        },
      },
      update: {
        description: role.description,
        level: role.level,
        isActive: true,
        deletedAt: null,
      },
      create: {
        organizationId,
        name: role.name,
        description: role.description,
        level: role.level,
        isActive: true,
      },
    });
  }

  console.log(`[seeds][roles] OK (${FOUNDATION_ROLES.length} roles con niveles jerarquicos).`);
}
