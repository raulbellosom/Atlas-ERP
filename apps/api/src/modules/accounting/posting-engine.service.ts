import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JournalEntryStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  ACCOUNTING_EVENTS,
  FinancialPostingPayload,
  TransferPostingPayload,
} from './events/financial-posting.payload';

@Injectable()
export class PostingEngineService {
  private readonly logger = new Logger(PostingEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent(ACCOUNTING_EVENTS.FINANCIAL_MOVEMENT_CREATED)
  async onFinancialMovementCreated(payload: FinancialPostingPayload): Promise<void> {
    await this.processFinancialMovement(payload);
  }

  @OnEvent(ACCOUNTING_EVENTS.TRANSFER_COMPLETED)
  async onTransferCompleted(payload: TransferPostingPayload): Promise<void> {
    await this.processTransfer(payload);
  }

  async processFinancialMovement(payload: FinancialPostingPayload): Promise<void> {
    const { tenantId, movementId, amount, currency, categoryCode, movementDate, description } =
      payload;

    const existing = await this.prisma.journalEntry.findUnique({
      where: { idempotencyKey: movementId },
    });
    if (existing) {
      this.logger.debug(`JournalEntry already exists for movementId=${movementId}, skipping.`);
      return;
    }

    const rule = await this.prisma.postingRule.findFirst({
      where: { organizationId: tenantId, categoryCode, isActive: true },
      include: { debitAccount: true, creditAccount: true },
    });

    if (!rule) {
      this.logger.warn(`No PostingRule for categoryCode=${categoryCode} org=${tenantId}`);
      await this.prisma.accountingPostingError.create({
        data: {
          organizationId: tenantId,
          movementId,
          eventType: payload.eventType,
          reason: `No active PostingRule for categoryCode=${categoryCode}`,
          payload: JSON.parse(JSON.stringify(payload)),
        },
      });
      return;
    }

    const fiscalPeriod = await this.getOrCreateFiscalPeriod(tenantId, movementDate);

    await this.prisma.journalEntry.create({
      data: {
        organizationId: tenantId,
        fiscalPeriodId: fiscalPeriod.id,
        idempotencyKey: movementId,
        description: description || `Posting: ${categoryCode}`,
        status: JournalEntryStatus.POSTED,
        postedAt: new Date(),
        lines: {
          create: [
            {
              debitAccountId: rule.debitAccountId,
              amount,
              currencyCode: currency,
              description: `Débito: ${rule.debitAccount.name}`,
            },
            {
              creditAccountId: rule.creditAccountId,
              amount,
              currencyCode: currency,
              description: `Crédito: ${rule.creditAccount.name}`,
            },
          ],
        },
      },
    });

    this.logger.log(
      JSON.stringify({ event: 'JOURNAL_ENTRY_CREATED', idempotencyKey: movementId, categoryCode }),
    );
  }

  async processTransfer(payload: TransferPostingPayload): Promise<void> {
    const { tenantId, transferId } = payload;
    const idempotencyKey = `transfer:${transferId}`;

    const existing = await this.prisma.journalEntry.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return;

    const rule = await this.prisma.postingRule.findFirst({
      where: { organizationId: tenantId, categoryCode: 'INTERNAL_TRANSFER', isActive: true },
      include: { debitAccount: true, creditAccount: true },
    });

    if (!rule) {
      this.logger.warn(`No PostingRule for categoryCode=INTERNAL_TRANSFER org=${tenantId}`);
      await this.prisma.accountingPostingError.create({
        data: {
          organizationId: tenantId,
          movementId: transferId,
          eventType: payload.eventType,
          reason: `No active PostingRule for categoryCode=INTERNAL_TRANSFER`,
          payload: JSON.parse(JSON.stringify(payload)),
        },
      });
      return;
    }

    const fiscalPeriod = await this.getOrCreateFiscalPeriod(tenantId, payload.transferDate);

    await this.prisma.journalEntry.create({
      data: {
        organizationId: tenantId,
        fiscalPeriodId: fiscalPeriod.id,
        idempotencyKey,
        description: `Transferencia interna`,
        status: JournalEntryStatus.POSTED,
        postedAt: new Date(),
        lines: {
          create: [
            {
              debitAccountId: rule.debitAccountId,
              amount: payload.amount,
              currencyCode: payload.currency,
              description: `Débito: ${rule.debitAccount.name}`,
            },
            {
              creditAccountId: rule.creditAccountId,
              amount: payload.amount,
              currencyCode: payload.currency,
              description: `Crédito: ${rule.creditAccount.name}`,
            },
          ],
        },
      },
    });
  }

  private async getOrCreateFiscalPeriod(
    organizationId: string,
    date: Date,
  ): Promise<{ id: string }> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const existing = await this.prisma.fiscalPeriod.findFirst({
      where: { organizationId, year, month },
      select: { id: true },
    });
    if (existing) return existing;

    return this.prisma.fiscalPeriod.create({
      data: { organizationId, year, month },
      select: { id: true },
    });
  }
}
