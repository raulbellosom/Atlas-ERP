import type { PrismaClient } from '@prisma/client';

type SettingSeed = {
  key: string;
  value: string;
  description: string;
  isActive: boolean;
};

const GLOBAL_SETTINGS: SettingSeed[] = [
  {
    key: 'platform.locale.default',
    value: 'es-MX',
    description: 'Idioma por defecto de la plataforma.',
    isActive: true,
  },
  {
    key: 'platform.timezone.default',
    value: 'America/Mexico_City',
    description: 'Zona horaria base para operación en México.',
    isActive: true,
  },
  {
    key: 'platform.currency.default',
    value: 'MXN',
    description: 'Moneda por defecto para operaciones iniciales.',
    isActive: true,
  },
  {
    key: 'sync.batch.max_items',
    value: '100',
    description: 'Tamaño máximo recomendado por lote de sincronización.',
    isActive: true,
  },
  {
    key: 'sync.retry.max_attempts',
    value: '3',
    description: 'Número máximo de reintentos de sincronización.',
    isActive: true,
  },
];

const ORGANIZATION_SETTINGS: SettingSeed[] = [
  {
    key: 'organization.ui.brand_name',
    value: 'AtlasERP Demo',
    description: 'Nombre comercial mostrado en la UI para la organización demo.',
    isActive: true,
  },
  {
    key: 'organization.sync.enabled',
    value: 'true',
    description: 'Activa los flujos de sincronización para la organización demo.',
    isActive: true,
  },
  {
    key: 'organization.audit.strict_mode',
    value: 'true',
    description: 'Habilita modo estricto de auditoría para operaciones críticas.',
    isActive: true,
  },
];

async function upsertGlobalSetting(prisma: PrismaClient, setting: SettingSeed): Promise<void> {
  const existing = await prisma.setting.findFirst({
    where: {
      organizationId: null,
      key: setting.key,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.setting.update({
      where: { id: existing.id },
      data: {
        value: setting.value,
        description: setting.description,
        isActive: setting.isActive,
      },
    });
    return;
  }

  await prisma.setting.create({
    data: {
      organizationId: null,
      key: setting.key,
      value: setting.value,
      description: setting.description,
      isActive: setting.isActive,
    },
  });
}

export async function seedSettings(prisma: PrismaClient, organizationId: string): Promise<void> {
  console.log('[seeds][settings] Upsert de settings iniciales...');

  for (const setting of GLOBAL_SETTINGS) {
    await upsertGlobalSetting(prisma, setting);
  }

  for (const setting of ORGANIZATION_SETTINGS) {
    await prisma.setting.upsert({
      where: {
        organizationId_key: {
          organizationId,
          key: setting.key,
        },
      },
      update: {
        value: setting.value,
        description: setting.description,
        isActive: setting.isActive,
      },
      create: {
        organizationId,
        key: setting.key,
        value: setting.value,
        description: setting.description,
        isActive: setting.isActive,
      },
    });
  }

  console.log(
    `[seeds][settings] OK (${GLOBAL_SETTINGS.length} globales, ${ORGANIZATION_SETTINGS.length} por organización).`,
  );
}
