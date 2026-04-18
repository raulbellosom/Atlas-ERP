import * as bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';

// Default dev password — MUST be changed in staging/production.
// Documents: T-0703 Bootstrap usuario root.
const DEV_DEFAULT_PASSWORD = 'AtlasERP.2026!';
const BCRYPT_COST = 12;

type UserSeed = {
  email: string;
  displayName: string;
  roleName: string;
};

const FOUNDATION_USERS: UserSeed[] = [
  {
    email: 'admin@atlaserp.local',
    displayName: 'Administrador AtlasERP',
    roleName: 'admin',
  },
  {
    email: 'tesoreria@atlaserp.local',
    displayName: 'Operador de Tesorería',
    roleName: 'tesorero',
  },
  {
    email: 'auditoria@atlaserp.local',
    displayName: 'Auditor Interno',
    roleName: 'auditor',
  },
];

export async function seedUsers(prisma: PrismaClient, organizationId: string): Promise<void> {
  console.log('[seeds][users] Upsert de usuarios iniciales...');

  const passwordHash = await bcrypt.hash(DEV_DEFAULT_PASSWORD, BCRYPT_COST);

  const roles = await prisma.role.findMany({
    where: {
      organizationId,
      name: { in: FOUNDATION_USERS.map((user) => user.roleName) },
    },
    select: { id: true, name: true },
  });

  const roleByName = new Map(roles.map((role) => [role.name, role.id]));

  for (const userSeed of FOUNDATION_USERS) {
    const user = await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId,
          email: userSeed.email,
        },
      },
      update: {
        displayName: userSeed.displayName,
        passwordHash,
        isActive: true,
        deletedAt: null,
      },
      create: {
        organizationId,
        email: userSeed.email,
        displayName: userSeed.displayName,
        passwordHash,
        isActive: true,
      },
      select: { id: true },
    });

    const roleId = roleByName.get(userSeed.roleName);

    if (!roleId) {
      throw new Error(`[seeds][users] Rol no encontrado para usuario ${userSeed.email}: ${userSeed.roleName}`);
    }

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId,
      },
    });
  }

  console.log(`[seeds][users] OK (${FOUNDATION_USERS.length} usuarios, password default seteado).`);
  console.log(`[seeds][users] ⚠  Contraseña dev por defecto: "${DEV_DEFAULT_PASSWORD}" — cambiar en staging/prod.`);
}
