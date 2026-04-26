import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountType, JournalEntryStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListAccountingReportQueryDto } from './dto/list-accounting-report.query.dto';

type AccountSnapshot = {
  id: string;
  code: string;
  name: string;
  accountType: AccountType;
  isActive: boolean;
  debitsCents: number;
  creditsCents: number;
};

function toCents(value: unknown): number {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

function fromCents(value: number): number {
  return Number((value / 100).toFixed(2));
}

function normalBalanceCents(accountType: AccountType, debitsCents: number, creditsCents: number): number {
  if (accountType === AccountType.ASSET || accountType === AccountType.EXPENSE) {
    return debitsCents - creditsCents;
  }
  return creditsCents - debitsCents;
}

@Injectable()
export class AccountingReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrialBalance(query: ListAccountingReportQueryDto) {
    const snapshots = await this.buildAccountSnapshots(query, 'exact');
    const rows = snapshots
      .filter((row) => row.debitsCents !== 0 || row.creditsCents !== 0)
      .map((row) => {
        const balanceCents = normalBalanceCents(row.accountType, row.debitsCents, row.creditsCents);
        return {
          accountId: row.id,
          code: row.code,
          name: row.name,
          accountType: row.accountType,
          debits: fromCents(row.debitsCents),
          credits: fromCents(row.creditsCents),
          balance: fromCents(balanceCents),
        };
      });

    const totalDebitsCents = rows.reduce((sum, row) => sum + toCents(row.debits), 0);
    const totalCreditsCents = rows.reduce((sum, row) => sum + toCents(row.credits), 0);

    return {
      organizationId: query.organizationId,
      year: query.year ?? null,
      month: query.month ?? null,
      generatedAt: new Date().toISOString(),
      rows,
      totals: {
        debits: fromCents(totalDebitsCents),
        credits: fromCents(totalCreditsCents),
        difference: fromCents(totalDebitsCents - totalCreditsCents),
      },
    };
  }

  async getIncomeStatement(query: ListAccountingReportQueryDto) {
    const snapshots = await this.buildAccountSnapshots(query, 'exact');

    const incomeRows = snapshots
      .filter((row) => row.accountType === AccountType.INCOME)
      .map((row) => ({
        accountId: row.id,
        code: row.code,
        name: row.name,
        amountCents: normalBalanceCents(row.accountType, row.debitsCents, row.creditsCents),
      }))
      .filter((row) => row.amountCents !== 0);

    const expenseRows = snapshots
      .filter((row) => row.accountType === AccountType.EXPENSE)
      .map((row) => ({
        accountId: row.id,
        code: row.code,
        name: row.name,
        amountCents: normalBalanceCents(row.accountType, row.debitsCents, row.creditsCents),
      }))
      .filter((row) => row.amountCents !== 0);

    const incomeTotalCents = incomeRows.reduce((sum, row) => sum + row.amountCents, 0);
    const expenseTotalCents = expenseRows.reduce((sum, row) => sum + row.amountCents, 0);

    return {
      organizationId: query.organizationId,
      year: query.year ?? null,
      month: query.month ?? null,
      generatedAt: new Date().toISOString(),
      income: incomeRows.map((row) => ({
        accountId: row.accountId,
        code: row.code,
        name: row.name,
        amount: fromCents(row.amountCents),
      })),
      expenses: expenseRows.map((row) => ({
        accountId: row.accountId,
        code: row.code,
        name: row.name,
        amount: fromCents(row.amountCents),
      })),
      totals: {
        income: fromCents(incomeTotalCents),
        expenses: fromCents(expenseTotalCents),
        netResult: fromCents(incomeTotalCents - expenseTotalCents),
      },
    };
  }

  async getBalanceSheet(query: ListAccountingReportQueryDto) {
    const snapshots = await this.buildAccountSnapshots(query, 'asOf');

    const assetRows = snapshots
      .filter((row) => row.accountType === AccountType.ASSET)
      .map((row) => ({
        accountId: row.id,
        code: row.code,
        name: row.name,
        amountCents: normalBalanceCents(row.accountType, row.debitsCents, row.creditsCents),
      }))
      .filter((row) => row.amountCents !== 0);

    const liabilityRows = snapshots
      .filter((row) => row.accountType === AccountType.LIABILITY)
      .map((row) => ({
        accountId: row.id,
        code: row.code,
        name: row.name,
        amountCents: normalBalanceCents(row.accountType, row.debitsCents, row.creditsCents),
      }))
      .filter((row) => row.amountCents !== 0);

    const equityRows = snapshots
      .filter((row) => row.accountType === AccountType.EQUITY)
      .map((row) => ({
        accountId: row.id,
        code: row.code,
        name: row.name,
        amountCents: normalBalanceCents(row.accountType, row.debitsCents, row.creditsCents),
      }))
      .filter((row) => row.amountCents !== 0);

    const incomeTotalCents = snapshots
      .filter((row) => row.accountType === AccountType.INCOME)
      .reduce((sum, row) => sum + normalBalanceCents(row.accountType, row.debitsCents, row.creditsCents), 0);
    const expenseTotalCents = snapshots
      .filter((row) => row.accountType === AccountType.EXPENSE)
      .reduce((sum, row) => sum + normalBalanceCents(row.accountType, row.debitsCents, row.creditsCents), 0);
    const periodResultCents = incomeTotalCents - expenseTotalCents;

    const equityWithResult = [...equityRows];
    if (periodResultCents !== 0) {
      equityWithResult.push({
        accountId: 'RESULTADO_PERIODO',
        code: 'RESULTADO',
        name: 'Resultado del periodo',
        amountCents: periodResultCents,
      });
    }

    const totalAssetsCents = assetRows.reduce((sum, row) => sum + row.amountCents, 0);
    const totalLiabilitiesCents = liabilityRows.reduce((sum, row) => sum + row.amountCents, 0);
    const totalEquityCents = equityWithResult.reduce((sum, row) => sum + row.amountCents, 0);
    const totalRightSideCents = totalLiabilitiesCents + totalEquityCents;

    return {
      organizationId: query.organizationId,
      year: query.year ?? null,
      month: query.month ?? null,
      generatedAt: new Date().toISOString(),
      assets: assetRows.map((row) => ({
        accountId: row.accountId,
        code: row.code,
        name: row.name,
        amount: fromCents(row.amountCents),
      })),
      liabilities: liabilityRows.map((row) => ({
        accountId: row.accountId,
        code: row.code,
        name: row.name,
        amount: fromCents(row.amountCents),
      })),
      equity: equityWithResult.map((row) => ({
        accountId: row.accountId,
        code: row.code,
        name: row.name,
        amount: fromCents(row.amountCents),
      })),
      totals: {
        assets: fromCents(totalAssetsCents),
        liabilities: fromCents(totalLiabilitiesCents),
        equity: fromCents(totalEquityCents),
        liabilitiesPlusEquity: fromCents(totalRightSideCents),
        difference: fromCents(totalAssetsCents - totalRightSideCents),
      },
    };
  }

  private validatePeriod(year?: number, month?: number): void {
    const hasYear = year !== undefined;
    const hasMonth = month !== undefined;
    if (hasYear !== hasMonth) {
      throw new BadRequestException('Debes enviar year y month juntos para filtrar el reporte.');
    }
  }

  private async getFiscalPeriodIds(
    organizationId: string,
    year: number | undefined,
    month: number | undefined,
    mode: 'exact' | 'asOf',
  ): Promise<string[] | undefined> {
    this.validatePeriod(year, month);
    if (year === undefined || month === undefined) return undefined;

    let where: Prisma.FiscalPeriodWhereInput;
    if (mode === 'exact') {
      where = { organizationId, year, month };
    } else {
      where = {
        organizationId,
        OR: [{ year: { lt: year } }, { year, month: { lte: month } }],
      };
    }

    const periods = await this.prisma.fiscalPeriod.findMany({
      where,
      select: { id: true },
    });

    return periods.map((period) => period.id);
  }

  private async buildAccountSnapshots(
    query: ListAccountingReportQueryDto,
    mode: 'exact' | 'asOf',
  ): Promise<AccountSnapshot[]> {
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { organizationId: query.organizationId },
      select: { id: true, code: true, name: true, accountType: true, isActive: true },
      orderBy: { code: 'asc' },
    });

    const snapshots = new Map<string, AccountSnapshot>();
    for (const account of accounts) {
      snapshots.set(account.id, {
        ...account,
        debitsCents: 0,
        creditsCents: 0,
      });
    }

    const fiscalPeriodIds = await this.getFiscalPeriodIds(
      query.organizationId,
      query.year,
      query.month,
      mode,
    );
    if (fiscalPeriodIds && fiscalPeriodIds.length === 0) {
      return Array.from(snapshots.values());
    }

    const lines = await this.prisma.journalEntryLine.findMany({
      where: {
        journalEntry: {
          organizationId: query.organizationId,
          status: JournalEntryStatus.POSTED,
          ...(fiscalPeriodIds ? { fiscalPeriodId: { in: fiscalPeriodIds } } : {}),
        },
      },
      select: {
        amount: true,
        debitAccountId: true,
        creditAccountId: true,
      },
    });

    for (const line of lines) {
      const amountCents = toCents(line.amount);
      if (line.debitAccountId && snapshots.has(line.debitAccountId)) {
        snapshots.get(line.debitAccountId)!.debitsCents += amountCents;
      }
      if (line.creditAccountId && snapshots.has(line.creditAccountId)) {
        snapshots.get(line.creditAccountId)!.creditsCents += amountCents;
      }
    }

    return Array.from(snapshots.values());
  }
}
