/**
 * AtlasERP - Seed de bootstrap para setup inicial sin datos demo de tenant.
 *
 * Ejecutar desde apps/api:  pnpm seed:setup
 * Ejecutar desde la raiz:   pnpm db:seed:setup
 */
import { PrismaClient } from '@prisma/client';
import { seedFeatureFlags } from './feature-flags.seed';
import { seedModuleStoreCatalog } from './module-store.seed';
import { seedPermissionsCatalog } from './permissions.seed';
import { seedGlobalSettings } from './settings.seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('[seeds][setup-bootstrap] Iniciando bootstrap sin datos demo...');

  await seedPermissionsCatalog(prisma);
  await seedFeatureFlags(prisma);
  await seedGlobalSettings(prisma);
  await seedModuleStoreCatalog(prisma);

  console.log('[seeds][setup-bootstrap] Bootstrap completado. Setup inicial habilitado.');
}

main()
  .catch((error: unknown) => {
    console.error('[seeds][setup-bootstrap] Error en ejecución:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
