import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { AccountingReportsService } from './accounting-reports.service';

describe('AccountingReportsService', () => {
  let service: AccountingReportsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountingReportsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get<AccountingReportsService>(AccountingReportsService);
  });

  it('genera balance de comprobacion con debitos y creditos balanceados', async () => {
    prismaMock.chartOfAccount.findMany.mockResolvedValue([
      { id: 'a1', code: '1100', name: 'Caja', accountType: 'ASSET', isActive: true },
      { id: 'i1', code: '4100', name: 'Ventas', accountType: 'INCOME', isActive: true },
    ]);
    prismaMock.fiscalPeriod.findMany.mockResolvedValue([{ id: 'fp-1' }]);
    prismaMock.journalEntryLine.findMany.mockResolvedValue([
      { amount: '1000', debitAccountId: 'a1', creditAccountId: null },
      { amount: '1000', debitAccountId: null, creditAccountId: 'i1' },
    ]);

    const report = await service.getTrialBalance({
      organizationId: 'org-1',
      year: 2026,
      month: 4,
    });

    expect(report.rows).toHaveLength(2);
    expect(report.totals.debits).toBe(1000);
    expect(report.totals.credits).toBe(1000);
    expect(report.totals.difference).toBe(0);
  });

  it('genera estado de resultados con utilidad neta', async () => {
    prismaMock.chartOfAccount.findMany.mockResolvedValue([
      { id: 'i1', code: '4100', name: 'Ventas', accountType: 'INCOME', isActive: true },
      { id: 'e1', code: '5200', name: 'Gastos Operativos', accountType: 'EXPENSE', isActive: true },
    ]);
    prismaMock.fiscalPeriod.findMany.mockResolvedValue([{ id: 'fp-1' }]);
    prismaMock.journalEntryLine.findMany.mockResolvedValue([
      { amount: '1000', debitAccountId: null, creditAccountId: 'i1' },
      { amount: '1000', debitAccountId: 'e1', creditAccountId: null },
      { amount: '300', debitAccountId: null, creditAccountId: 'i1' },
      { amount: '300', debitAccountId: 'e1', creditAccountId: null },
      { amount: '400', debitAccountId: null, creditAccountId: 'i1' },
      { amount: '400', debitAccountId: 'e1', creditAccountId: null },
    ]);

    const report = await service.getIncomeStatement({
      organizationId: 'org-1',
      year: 2026,
      month: 4,
    });

    expect(report.totals.income).toBe(1700);
    expect(report.totals.expenses).toBe(1700);
    expect(report.totals.netResult).toBe(0);
  });

  it('genera balance general y valida ecuacion contable', async () => {
    prismaMock.chartOfAccount.findMany.mockResolvedValue([
      { id: 'a1', code: '1100', name: 'Caja', accountType: 'ASSET', isActive: true },
      { id: 'l1', code: '2100', name: 'Cuentas por pagar', accountType: 'LIABILITY', isActive: true },
      { id: 'e1', code: '3100', name: 'Capital', accountType: 'EQUITY', isActive: true },
      { id: 'i1', code: '4100', name: 'Ventas', accountType: 'INCOME', isActive: true },
      { id: 'x1', code: '5100', name: 'Gastos', accountType: 'EXPENSE', isActive: true },
    ]);
    prismaMock.fiscalPeriod.findMany.mockResolvedValue([{ id: 'fp-1' }]);
    prismaMock.journalEntryLine.findMany.mockResolvedValue([
      { amount: '1500', debitAccountId: 'a1', creditAccountId: null },
      { amount: '1500', debitAccountId: null, creditAccountId: 'e1' },
      { amount: '600', debitAccountId: 'a1', creditAccountId: null },
      { amount: '600', debitAccountId: null, creditAccountId: 'i1' },
      { amount: '200', debitAccountId: 'x1', creditAccountId: null },
      { amount: '200', debitAccountId: null, creditAccountId: 'a1' },
      { amount: '100', debitAccountId: 'a1', creditAccountId: null },
      { amount: '100', debitAccountId: null, creditAccountId: 'l1' },
    ]);

    const report = await service.getBalanceSheet({
      organizationId: 'org-1',
      year: 2026,
      month: 4,
    });

    expect(report.totals.assets).toBe(2000);
    expect(report.totals.liabilitiesPlusEquity).toBe(2000);
    expect(report.totals.difference).toBe(0);
  });
});
