import type { PrismaClient } from '@prisma/client';

export type SeedOrganizationResult = {
  organizationId: string;
};

const DEMO_ORGANIZATION = {
  name: 'AtlasERP Demo',
  slug: 'atlaserp-demo',
};

export async function seedOrganization(prisma: PrismaClient): Promise<SeedOrganizationResult> {
  console.log('[seeds][organization] Upsert de organización demo...');

  const organization = await prisma.organization.upsert({
    where: { slug: DEMO_ORGANIZATION.slug },
    update: {
      name: DEMO_ORGANIZATION.name,
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: DEMO_ORGANIZATION.name,
      slug: DEMO_ORGANIZATION.slug,
      isActive: true,
    },
    select: { id: true },
  });

  console.log(`[seeds][organization] OK (${organization.id}).`);

  return {
    organizationId: organization.id,
  };
}
