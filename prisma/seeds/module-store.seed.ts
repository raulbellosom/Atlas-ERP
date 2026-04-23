import type { PrismaClient } from '@prisma/client';

const CURATED_MODULES = [
  {
    moduleKey: 'core-platform',
    name: 'Core Platform',
    description: 'Módulo base obligatorio. Gestión de organización, usuarios, roles y permisos.',
    isCore: true,
    version: '1.0.0',
    compatibilityRange: '>=1.0.0',
  },
  {
    moduleKey: 'financial-operations',
    name: 'Financial Operations',
    description: 'Tesorería: cuentas bancarias, movimientos, transferencias y conciliación.',
    isCore: false,
    version: '1.0.0',
    compatibilityRange: '>=1.0.0',
  },
  {
    moduleKey: 'accounting',
    name: 'Accounting',
    description: 'Contabilidad: plan de cuentas, asientos, períodos fiscales y motor de posting.',
    isCore: false,
    version: '1.0.0',
    compatibilityRange: '>=1.0.0',
  },
  {
    moduleKey: 'hr',
    name: 'Human Resources',
    description: 'Recursos humanos: empleados, contratos, solicitudes de licencia y documentos.',
    isCore: false,
    version: '1.0.0',
    compatibilityRange: '>=1.0.0',
  },
] as const;

export async function seedModuleStoreCatalog(prisma: PrismaClient): Promise<void> {
  console.log('[seeds][module-store] Upsert de definiciones de módulos curados...');

  for (const mod of CURATED_MODULES) {
    await prisma.moduleDefinition.upsert({
      where: { moduleKey: mod.moduleKey },
      update: {
        name: mod.name,
        description: mod.description,
        isCore: mod.isCore,
        lifecycleState: 'ACTIVE',
      },
      create: {
        moduleKey: mod.moduleKey,
        name: mod.name,
        description: mod.description,
        isCore: mod.isCore,
        lifecycleState: 'ACTIVE',
      },
    });

    await prisma.moduleVersion.upsert({
      where: { moduleKey_version: { moduleKey: mod.moduleKey, version: mod.version } },
      update: { compatibilityRange: mod.compatibilityRange },
      create: {
        moduleKey: mod.moduleKey,
        version: mod.version,
        compatibilityRange: mod.compatibilityRange,
        manifestChecksum: 'curated-v1',
      },
    });
  }

  console.log(`[seeds][module-store] ${CURATED_MODULES.length} módulos upserted.`);
}
