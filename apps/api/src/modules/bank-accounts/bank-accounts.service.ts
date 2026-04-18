import { Injectable } from '@nestjs/common';
import { Prisma, SourceType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { ListBankAccountsQueryDto } from './dto/list-bank-accounts.query.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

const BANK_ACCOUNT_SELECT = {
  id: true,
  organizationId: true,
  branchId: true,
  bankAccountTypeId: true,
  createdById: true,
  name: true,
  bankName: true,
  accountHolder: true,
  accountNumberMask: true,
  currencyCode: true,
  currentBalance: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BankAccountSelect;

type BankAccountSummary = Prisma.BankAccountGetPayload<{
  select: typeof BANK_ACCOUNT_SELECT;
}>;

type BankAccountBalance = {
  bankAccountId: string;
  organizationId: string;
  name: string;
  bankName: string;
  accountNumberMask: string;
  currencyCode: string;
  currentBalance: string;
  isActive: boolean;
  updatedAt: Date;
};

type BalanceSummaryByCurrency = {
  currencyCode: string;
  totalBalance: string;
  accountCount: number;
};

type OrganizationBalanceSummary = {
  organizationId: string;
  accountCount: number;
  activeAccountCount: number;
  totalsByCurrency: BalanceSummaryByCurrency[];
  generatedAt: string;
};

@Injectable()
export class BankAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(input: CreateBankAccountDto): Promise<BankAccountSummary> {
    const created = await this.prisma.bankAccount.create({
      data: {
        organizationId: input.organizationId,
        branchId: input.branchId,
        bankAccountTypeId: input.bankAccountTypeId,
        createdById: input.createdById,
        name: input.name,
        bankName: input.bankName,
        accountHolder: input.accountHolder,
        accountNumberMask: input.accountNumberMask,
        currencyCode: input.currencyCode ?? 'MXN',
        currentBalance: input.currentBalance ?? '0',
        isActive: true,
      },
      select: BANK_ACCOUNT_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: created.organizationId,
      actorId: input.createdById,
      action: 'BANK_ACCOUNT_CREATED',
      entityType: 'bank_account',
      entityId: created.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        name: created.name,
        bankName: created.bankName,
        currencyCode: created.currencyCode,
        currentBalance: created.currentBalance.toString(),
        isActive: created.isActive,
      },
    });

    return created;
  }

  async findAll(query: ListBankAccountsQueryDto): Promise<BankAccountSummary[]> {
    const where: Prisma.BankAccountWhereInput = {
      deletedAt: null,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.bankAccountTypeId ? { bankAccountTypeId: query.bankAccountTypeId } : {}),
      ...(query.includeInactive ? {} : { isActive: true }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { bankName: { contains: query.search, mode: 'insensitive' } },
              { accountHolder: { contains: query.search, mode: 'insensitive' } },
              { accountNumberMask: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.bankAccount.findMany({
      where,
      select: BANK_ACCOUNT_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async findOneById(id: string): Promise<BankAccountSummary | null> {
    return this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
      select: BANK_ACCOUNT_SELECT,
    });
  }

  async update(
    id: string,
    input: UpdateBankAccountDto,
  ): Promise<BankAccountSummary | null> {
    const existing = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Prisma.BankAccountUncheckedUpdateInput = {
      ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
      ...(input.bankAccountTypeId !== undefined
        ? { bankAccountTypeId: input.bankAccountTypeId }
        : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.bankName !== undefined ? { bankName: input.bankName } : {}),
      ...(input.accountHolder !== undefined
        ? { accountHolder: input.accountHolder }
        : {}),
      ...(input.accountNumberMask !== undefined
        ? { accountNumberMask: input.accountNumberMask }
        : {}),
      ...(input.currencyCode !== undefined ? { currencyCode: input.currencyCode } : {}),
      ...(input.currentBalance !== undefined
        ? { currentBalance: input.currentBalance }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };

    const updated = await this.prisma.bankAccount.update({
      where: { id },
      data,
      select: BANK_ACCOUNT_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      action: 'BANK_ACCOUNT_UPDATED',
      entityType: 'bank_account',
      entityId: updated.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        name: updated.name,
        bankName: updated.bankName,
        currencyCode: updated.currencyCode,
        currentBalance: updated.currentBalance.toString(),
        isActive: updated.isActive,
      },
    });

    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    const existing = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!existing) {
      return false;
    }

    const result = await this.prisma.bankAccount.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    if (result.count > 0) {
      await this.auditService.auditAction({
        organizationId: existing.organizationId,
        action: 'BANK_ACCOUNT_DELETED',
        entityType: 'bank_account',
        entityId: existing.id,
        origin: SourceType.API,
        result: 'SUCCESS',
      });
    }

    return result.count > 0;
  }

  async countActiveByOrganization(organizationId: string): Promise<number> {
    return this.prisma.bankAccount.count({
      where: {
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async getBalanceByAccount(id: string): Promise<BankAccountBalance | null> {
    const account = await this.prisma.bankAccount.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        bankName: true,
        accountNumberMask: true,
        currencyCode: true,
        currentBalance: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (!account) {
      return null;
    }

    return {
      bankAccountId: account.id,
      organizationId: account.organizationId,
      name: account.name,
      bankName: account.bankName,
      accountNumberMask: account.accountNumberMask,
      currencyCode: account.currencyCode,
      currentBalance: account.currentBalance.toString(),
      isActive: account.isActive,
      updatedAt: account.updatedAt,
    };
  }

  async getBalanceSummaryByOrganization(
    organizationId: string,
    includeInactive = false,
  ): Promise<OrganizationBalanceSummary> {
    const accounts = await this.prisma.bankAccount.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      select: {
        currencyCode: true,
        currentBalance: true,
        isActive: true,
      },
    });

    const totalsByCurrencyMap = new Map<
      string,
      { total: Prisma.Decimal; count: number }
    >();

    for (const account of accounts) {
      const existing = totalsByCurrencyMap.get(account.currencyCode);
      if (!existing) {
        totalsByCurrencyMap.set(account.currencyCode, {
          total: new Prisma.Decimal(account.currentBalance),
          count: 1,
        });
      } else {
        existing.total = existing.total.plus(account.currentBalance);
        existing.count += 1;
      }
    }

    const totalsByCurrency: BalanceSummaryByCurrency[] = Array.from(
      totalsByCurrencyMap.entries(),
    )
      .map(([currencyCode, value]) => ({
        currencyCode,
        totalBalance: value.total.toString(),
        accountCount: value.count,
      }))
      .sort((a, b) => a.currencyCode.localeCompare(b.currencyCode));

    return {
      organizationId,
      accountCount: accounts.length,
      activeAccountCount: accounts.filter((account) => account.isActive).length,
      totalsByCurrency,
      generatedAt: new Date().toISOString(),
    };
  }
}
