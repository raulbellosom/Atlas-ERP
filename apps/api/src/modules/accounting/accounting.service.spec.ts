import { ConflictException, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { chartOfAccountFactory } from '../../test-utils/factories/chart-of-account.factory';
import { AccountingService } from './accounting.service';

describe('AccountingService', () => {
  let service: AccountingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountingService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get<AccountingService>(AccountingService);
  });

  describe('createChartOfAccount', () => {
    it('creates a new chart of account', async () => {
      const account = chartOfAccountFactory({ code: '1100', name: 'Bancos' });
      prismaMock.chartOfAccount.findFirst.mockResolvedValue(null);
      prismaMock.chartOfAccount.create.mockResolvedValue(account);

      const result = await service.createChartOfAccount({
        organizationId: 'org-1',
        code: '1100',
        name: 'Bancos',
        accountType: 'ASSET' as any,
      });

      expect(result.code).toBe('1100');
      expect(prismaMock.chartOfAccount.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException if code already exists', async () => {
      prismaMock.chartOfAccount.findFirst.mockResolvedValue(chartOfAccountFactory());

      await expect(
        service.createChartOfAccount({
          organizationId: 'org-1',
          code: '1100',
          name: 'Bancos',
          accountType: 'ASSET' as any,
        }),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.chartOfAccount.create).not.toHaveBeenCalled();
    });
  });

  describe('getChartOfAccount', () => {
    it('throws NotFoundException when not found', async () => {
      prismaMock.chartOfAccount.findUnique.mockResolvedValue(null);
      await expect(service.getChartOfAccount('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('returns the account when found', async () => {
      const account = chartOfAccountFactory();
      prismaMock.chartOfAccount.findUnique.mockResolvedValue(account);
      const result = await service.getChartOfAccount(account.id);
      expect(result.id).toBe(account.id);
    });
  });

  describe('closeFiscalPeriod', () => {
    it('throws NotFoundException when period not found', async () => {
      prismaMock.fiscalPeriod.findUnique.mockResolvedValue(null);
      await expect(service.closeFiscalPeriod('fp-99')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when already closed', async () => {
      prismaMock.fiscalPeriod.findUnique.mockResolvedValue({ id: 'fp-1', status: 'CLOSED' });
      await expect(service.closeFiscalPeriod('fp-1')).rejects.toThrow(ConflictException);
    });

    it('closes an open period', async () => {
      prismaMock.fiscalPeriod.findUnique.mockResolvedValue({ id: 'fp-1', status: 'OPEN' });
      prismaMock.fiscalPeriod.update.mockResolvedValue({ id: 'fp-1', status: 'CLOSED' });

      const result = await service.closeFiscalPeriod('fp-1');
      expect(result.status).toBe('CLOSED');
      expect(prismaMock.fiscalPeriod.update).toHaveBeenCalledTimes(1);
    });
  });
});
