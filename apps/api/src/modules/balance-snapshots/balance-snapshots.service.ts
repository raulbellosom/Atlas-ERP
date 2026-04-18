import { Injectable } from '@nestjs/common';
import { BalanceSnapshotSource, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListBalanceSnapshotsQueryDto } from './dto/list-balance-snapshots.query.dto';

const BALANCE_SNAPSHOT_SELECT = {
  id: true,
  organizationId: true,
  bankAccountId: true,
  branchId: true,
  capturedById: true,
  snapshotAt: true,
  balance: true,
  currencyCode: true,
  source: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BalanceSnapshotSelect;

type BalanceSnapshotSummary = Prisma.BalanceSnapshotGetPayload<{
  select: typeof BALANCE_SNAPSHOT_SELECT;
}>;

type CreateBalanceSnapshotInput = {
  organizationId: string;
  bankAccountId: string;
  branchId?: string;
  capturedById?: string;
  snapshotAt: string;
  balance: string;
  currencyCode?: string;
  source?: BalanceSnapshotSource;
};

@Injectable()
export class BalanceSnapshotsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateBalanceSnapshotInput): Promise<BalanceSnapshotSummary> {
    return this.prisma.balanceSnapshot.create({
      data: {
        organizationId: input.organizationId,
        bankAccountId: input.bankAccountId,
        branchId: input.branchId,
        capturedById: input.capturedById,
        snapshotAt: new Date(input.snapshotAt),
        balance: input.balance,
        currencyCode: input.currencyCode ?? 'MXN',
        source: input.source ?? BalanceSnapshotSource.MANUAL,
      },
      select: BALANCE_SNAPSHOT_SELECT,
    });
  }

  async findAll(
    query: ListBalanceSnapshotsQueryDto,
  ): Promise<BalanceSnapshotSummary[]> {
    const where: Prisma.BalanceSnapshotWhereInput = {
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.bankAccountId ? { bankAccountId: query.bankAccountId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.from || query.to
        ? {
            snapshotAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    return this.prisma.balanceSnapshot.findMany({
      where,
      select: BALANCE_SNAPSHOT_SELECT,
      orderBy: [{ snapshotAt: 'desc' }, { id: 'asc' }],
      ...(query.limit ? { take: query.limit } : {}),
    });
  }

  async findOneById(id: string): Promise<BalanceSnapshotSummary | null> {
    return this.prisma.balanceSnapshot.findUnique({
      where: { id },
      select: BALANCE_SNAPSHOT_SELECT,
    });
  }

  async findLatestByBankAccount(
    bankAccountId: string,
  ): Promise<BalanceSnapshotSummary | null> {
    return this.prisma.balanceSnapshot.findFirst({
      where: { bankAccountId },
      select: BALANCE_SNAPSHOT_SELECT,
      orderBy: [{ snapshotAt: 'desc' }, { id: 'desc' }],
    });
  }
}
