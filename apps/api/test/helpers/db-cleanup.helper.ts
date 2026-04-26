import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ??
        'postgresql://atlaserp:atlaserp_dev@localhost:5432/atlaserp_dev',
    },
  },
});

export async function cleanTestTables(): Promise<void> {
  await prisma.$transaction([
    prisma.financialMovementAttachment.deleteMany(),
    prisma.balanceSnapshot.deleteMany(),
    prisma.transfer.deleteMany(),
    prisma.financialMovement.deleteMany(),
    prisma.bankAccount.deleteMany(),
  ]);
}

export async function disconnectTestDb(): Promise<void> {
  await prisma.$disconnect();
}

