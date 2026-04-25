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
    value: 'AtlasERP',
    description: 'Nombre comercial mostrado en la UI para la organización activa.',
    isActive: true,
  },
  {
    key: 'organization.locale',
    value: 'es-MX',
    description: 'Idioma de la interfaz para esta organización.',
    isActive: true,
  },
  {
    key: 'organization.timezone',
    value: 'America/Mexico_City',
    description: 'Zona horaria de la organización.',
    isActive: true,
  },
  {
    key: 'organization.currency',
    value: 'MXN',
    description: 'Moneda principal de la organización.',
    isActive: true,
  },
  {
    key: 'organization.profile.industry',
    value: '',
    description: 'Sector o rubro de la organización.',
    isActive: true,
  },
  {
    key: 'organization.profile.company_size',
    value: '',
    description: 'Tamaño de la organización por número de empleados.',
    isActive: true,
  },
  {
    key: 'organization.sync.enabled',
    value: 'true',
    description: 'Activa los flujos de sincronización para la organización activa.',
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

  await seedGlobalSettings(prisma);
  await seedOrganizationSettings(prisma, organizationId);
  await backfillOrganizationSettings(prisma);

  console.log(
    `[seeds][settings] OK (${GLOBAL_SETTINGS.length} globales, ${ORGANIZATION_SETTINGS.length} por organización).`,
  );
}

export async function seedGlobalSettings(prisma: PrismaClient): Promise<void> {
  console.log('[seeds][settings] Upsert de settings globales...');

  for (const setting of GLOBAL_SETTINGS) {
    await upsertGlobalSetting(prisma, setting);
  }
}

export async function seedOrganizationSettings(
  prisma: PrismaClient,
  organizationId: string,
  options?: { brandName?: string },
): Promise<void> {
  console.log('[seeds][settings] Upsert de settings por organización...');

  const organizationSettings = ORGANIZATION_SETTINGS.map((setting) =>
    setting.key === 'organization.ui.brand_name' && options?.brandName
      ? { ...setting, value: options.brandName }
      : setting,
  );

  for (const setting of organizationSettings) {
    await prisma.setting.upsert({
      where: {
        organizationId_key: {
          organizationId,
          key: setting.key,
        },
      },
      update: {
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
}

export async function backfillOrganizationSettings(prisma: PrismaClient): Promise<void> {
  const orgs = await prisma.organization.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true },
  });

  for (const org of orgs) {
    for (const setting of ORGANIZATION_SETTINGS) {
      await prisma.setting.upsert({
        where: { organizationId_key: { organizationId: org.id, key: setting.key } },
        update: { description: setting.description, isActive: setting.isActive },
        create: {
          organizationId: org.id,
          key: setting.key,
          value: setting.value,
          description: setting.description,
          isActive: setting.isActive,
        },
      });
    }
  }
}
