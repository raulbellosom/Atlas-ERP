import type { PrismaClient } from '@prisma/client';

const CURATED_MODULES = [
  {
    moduleKey: 'core-platform',
    name: 'Plataforma Base',
    description: 'Modulo base obligatorio. Gestion de organizacion, usuarios, roles y permisos.',
    isCore: true,
    ownerModule: 'core-platform',
    version: '1.0.0',
    compatibilityRange: '>=1.0.0',
  },
  {
    moduleKey: 'financial-operations',
    name: 'Tesorería',
    description:
      'Cuentas bancarias, movimientos, transferencias, conciliacion y reportes financieros.',
    isCore: false,
    ownerModule: 'financial-operations',
    version: '1.0.0',
    compatibilityRange: '>=1.0.0',
  },
  {
    moduleKey: 'accounting',
    name: 'Contabilidad',
    description:
      'Plan de cuentas, asientos contables, periodos fiscales y motor de posting automatico.',
    isCore: false,
    ownerModule: 'accounting',
    version: '1.0.0',
    compatibilityRange: '>=1.0.0',
  },
  {
    moduleKey: 'hr',
    name: 'Recursos Humanos',
    description:
      'Empleados, contratos, departamentos, solicitudes de ausencia y documentos de personal.',
    isCore: false,
    ownerModule: 'hr',
    version: '1.0.0',
    compatibilityRange: '>=1.0.0',
  },
] as const;

const MODULE_DEPENDENCIES = [
  {
    moduleKey: 'financial-operations',
    dependsOnModuleKey: 'core-platform',
    versionConstraint: '>=1.0.0',
    isHardDependency: true,
  },
  {
    moduleKey: 'accounting',
    dependsOnModuleKey: 'core-platform',
    versionConstraint: '>=1.0.0',
    isHardDependency: true,
  },
  {
    moduleKey: 'accounting',
    dependsOnModuleKey: 'financial-operations',
    versionConstraint: '>=1.0.0',
    isHardDependency: true,
  },
  {
    moduleKey: 'hr',
    dependsOnModuleKey: 'core-platform',
    versionConstraint: '>=1.0.0',
    isHardDependency: true,
  },
] as const;

export async function seedModuleStoreCatalog(prisma: PrismaClient): Promise<void> {
  console.log('[seeds][module-store] Upsert de definiciones de modulos curados...');

  for (const mod of CURATED_MODULES) {
    await prisma.moduleDefinition.upsert({
      where: { moduleKey: mod.moduleKey },
      update: {
        name: mod.name,
        description: mod.description,
        isCore: mod.isCore,
        ownerModule: mod.ownerModule,
        lifecycleState: 'ACTIVE',
      },
      create: {
        moduleKey: mod.moduleKey,
        name: mod.name,
        description: mod.description,
        isCore: mod.isCore,
        ownerModule: mod.ownerModule,
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

  for (const dependency of MODULE_DEPENDENCIES) {
    await prisma.moduleDependency.upsert({
      where: {
        moduleKey_dependsOnModuleKey: {
          moduleKey: dependency.moduleKey,
          dependsOnModuleKey: dependency.dependsOnModuleKey,
        },
      },
      update: {
        versionConstraint: dependency.versionConstraint,
        isHardDependency: dependency.isHardDependency,
      },
      create: dependency,
    });
  }

  console.log(
    `[seeds][module-store] ${CURATED_MODULES.length} modulos y ${MODULE_DEPENDENCIES.length} dependencias upserted.`,
  );
}
