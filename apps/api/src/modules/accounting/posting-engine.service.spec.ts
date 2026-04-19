import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { FinancialPostingPayload } from './events/financial-posting.payload';
import { PostingEngineService } from './posting-engine.service';

const mockFiscalPeriod = {
  id: 'fp-1',
  organizationId: 'org-1',
  year: 2026,
  month: 4,
  status: 'OPEN',
  closedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDebitAccount = { id: 'coa-1', code: '1100', name: 'Bancos' };
const mockCreditAccount = { id: 'coa-2', code: '4100', name: 'Ingresos' };
const mockPostingRule = {
  id: 'rule-1',
  categoryCode: 'SALE_INCOME',
  movementType: 'INCOME',
  debitAccountId: 'coa-1',
  creditAccountId: 'coa-2',
  debitAccount: mockDebitAccount,
  creditAccount: mockCreditAccount,
};
const mockJournalEntry = { id: 'je-1', idempotencyKey: 'mov-1', status: 'POSTED' };

const basePayload: FinancialPostingPayload = {
  eventType: 'financial.movement.created',
  tenantId: 'org-1',
  movementId: 'mov-1',
  amount: 1000,
  currency: 'MXN',
  bankAccountId: 'ba-1',
  categoryCode: 'SALE_INCOME',
  movementDate: new Date('2026-04-01'),
  description: 'Venta',
  userId: 'user-1',
};

describe('PostingEngineService', () => {
  let service: PostingEngineService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostingEngineService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get<PostingEngineService>(PostingEngineService);
  });

  it('creates a JournalEntry when posting rule exists and no duplicate', async () => {
    prismaMock.journalEntry.findUnique.mockResolvedValue(null);
    prismaMock.postingRule.findFirst.mockResolvedValue(mockPostingRule);
    prismaMock.fiscalPeriod.findFirst.mockResolvedValue(mockFiscalPeriod);
    prismaMock.journalEntry.create.mockResolvedValue(mockJournalEntry);

    await service.processFinancialMovement(basePayload);

    expect(prismaMock.journalEntry.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.journalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          idempotencyKey: 'mov-1',
          organizationId: 'org-1',
          status: 'POSTED',
        }),
      }),
    );
  });

  it('skips if JournalEntry already exists (idempotency)', async () => {
    prismaMock.journalEntry.findUnique.mockResolvedValue(mockJournalEntry);

    await service.processFinancialMovement(basePayload);

    expect(prismaMock.journalEntry.create).not.toHaveBeenCalled();
    expect(prismaMock.postingRule.findFirst).not.toHaveBeenCalled();
  });

  it('records posting error when no posting rule found', async () => {
    prismaMock.journalEntry.findUnique.mockResolvedValue(null);
    prismaMock.postingRule.findFirst.mockResolvedValue(null);
    prismaMock.accountingPostingError.create.mockResolvedValue({ id: 'err-1' });

    await service.processFinancialMovement({
      ...basePayload,
      movementId: 'mov-99',
      categoryCode: 'UNKNOWN_CATEGORY',
    });

    expect(prismaMock.journalEntry.create).not.toHaveBeenCalled();
    expect(prismaMock.accountingPostingError.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.accountingPostingError.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reason: expect.stringContaining('UNKNOWN_CATEGORY'),
        }),
      }),
    );
  });

  it('auto-creates fiscal period when it does not exist', async () => {
    prismaMock.journalEntry.findUnique.mockResolvedValue(null);
    prismaMock.postingRule.findFirst.mockResolvedValue(mockPostingRule);
    prismaMock.fiscalPeriod.findFirst.mockResolvedValue(null);
    prismaMock.fiscalPeriod.create.mockResolvedValue(mockFiscalPeriod);
    prismaMock.journalEntry.create.mockResolvedValue(mockJournalEntry);

    await service.processFinancialMovement(basePayload);

    expect(prismaMock.fiscalPeriod.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.journalEntry.create).toHaveBeenCalledTimes(1);
  });
});
