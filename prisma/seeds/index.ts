/**
 * AtlasERP - Seed principal de la base de datos
 *
 * Ejecutar desde apps/api:  pnpm db:seed
 * Ejecutar desde la raiz:   pnpm db:seed
 *
 * Estrategia de seeds: docs/02-architecture/29-prisma-estrategia-seeds.md
 */
import { PrismaClient } from '@prisma/client';
import { seedOrganization } from './organizations.seed';
import { seedRoles } from './roles.seed';
import { seedPermissionsAndRoleMapping } from './permissions.seed';
import { seedUsers } from './users.seed';
import { seedFeatureFlags } from './feature-flags.seed';
import { seedSettings } from './settings.seed';
import { seedFinancialOperationsCore } from './financial-operations.seed';
import { seedAccounting } from './accounting.seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('[seeds] Iniciando pipeline de seeds...');

  const { organizationId } = await seedOrganization(prisma);
  await seedRoles(prisma, organizationId);
  await seedPermissionsAndRoleMapping(prisma, organizationId);
  await seedUsers(prisma, organizationId);
  await seedFeatureFlags(prisma);
  await seedSettings(prisma, organizationId);
  await seedFinancialOperationsCore(prisma, organizationId);
  await seedAccounting(prisma, organizationId);

  console.log('[seeds] Pipeline completado con seeds foundation + financial demo activas.');
}

main()
  .catch((error: unknown) => {
    console.error('[seeds] Error en ejecución:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
