import type { PrismaClient } from '@prisma/client';

type FeatureFlagSeed = {
  key: string;
  description: string;
  defaultValue: boolean;
  isActive: boolean;
};

const FOUNDATION_FEATURE_FLAGS: FeatureFlagSeed[] = [
  {
    key: 'financial.reconciliation.enabled',
    description: 'Habilita los flujos de conciliación financiera en módulos activos.',
    defaultValue: false,
    isActive: true,
  },
  {
    key: 'sync.auto_retry.enabled',
    description: 'Permite reintentos automáticos controlados en el motor de sincronización.',
    defaultValue: true,
    isActive: true,
  },
  {
    key: 'desktop.offline_mode.enabled',
    description: 'Activa capacidades offline en cliente desktop bajo política de sync.',
    defaultValue: true,
    isActive: true,
  },
  {
    key: 'admin.bulk_operations.enabled',
    description: 'Habilita operaciones masivas administrativas para usuarios con permisos.',
    defaultValue: false,
    isActive: true,
  },
  {
    key: 'notifications.in_app.enabled',
    description: 'Activa notificaciones internas in-app en el foundation.',
    defaultValue: true,
    isActive: true,
  },
];

export async function seedFeatureFlags(prisma: PrismaClient): Promise<void> {
  console.log('[seeds][feature-flags] Upsert de feature flags iniciales...');

  for (const flag of FOUNDATION_FEATURE_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {
        description: flag.description,
        defaultValue: flag.defaultValue,
        isActive: flag.isActive,
      },
      create: {
        key: flag.key,
        description: flag.description,
        defaultValue: flag.defaultValue,
        isActive: flag.isActive,
      },
    });
  }

  console.log(`[seeds][feature-flags] OK (${FOUNDATION_FEATURE_FLAGS.length} flags).`);
}
