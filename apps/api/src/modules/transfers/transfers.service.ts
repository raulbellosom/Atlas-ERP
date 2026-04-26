import { Injectable, Logger } from '@nestjs/common';
import {
  FinancialMovementStatus,
  FinancialMovementType,
  Prisma,
  SourceType,
  TransferStatus,
} from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  ACCOUNTING_EVENTS,
  TransferPostingPayload,
} from '../accounting/events/financial-posting.payload';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ListTransfersQueryDto } from './dto/list-transfers.query.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';

const TRANSFER_SELECT = {
  id: true,
  organizationId: true,
  fromBankAccountId: true,
  toBankAccountId: true,
  branchId: true,
  outgoingMovementId: true,
  incomingMovementId: true,
  initiatedById: true,
  approvedById: true,
  status: true,
  amount: true,
  currencyCode: true,
  occurredAt: true,
  description: true,
  reference: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TransferSelect;

type TransferSummary = Prisma.TransferGetPayload<{ select: typeof TRANSFER_SELECT }>;

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(input: CreateTransferDto): Promise<TransferSummary> {
    const effectiveStatus = input.status ?? TransferStatus.POSTED;

    const created = await this.prisma.$transaction(async (tx) => {
      // 1. Crear los 2 movimientos espejo
      const outgoingMovement = await tx.financialMovement.create({
        data: {
          organizationId: input.organizationId,
          bankAccountId: input.fromBankAccountId,
          branchId: input.branchId,
          createdById: input.initiatedById,
          movementType: FinancialMovementType.TRANSFER_OUT,
          status:
            effectiveStatus === TransferStatus.POSTED
              ? FinancialMovementStatus.POSTED
              : FinancialMovementStatus.DRAFT,
          amount: input.amount,
          currencyCode: input.currencyCode ?? 'MXN',
          occurredAt: new Date(input.occurredAt),
          description: input.description ?? 'Transferencia saliente',
          reference: input.reference,
          categoryCode: 'INTERNAL_TRANSFER',
        },
        select: { id: true },
      });

      const incomingMovement = await tx.financialMovement.create({
        data: {
          organizationId: input.organizationId,
          bankAccountId: input.toBankAccountId,
          branchId: input.branchId,
          createdById: input.initiatedById,
          movementType: FinancialMovementType.TRANSFER_IN,
          status:
            effectiveStatus === TransferStatus.POSTED
              ? FinancialMovementStatus.POSTED
              : FinancialMovementStatus.DRAFT,
          amount: input.amount,
          currencyCode: input.currencyCode ?? 'MXN',
          occurredAt: new Date(input.occurredAt),
          description: input.description ?? 'Transferencia entrante',
          reference: input.reference,
          categoryCode: 'INTERNAL_TRANSFER',
        },
        select: { id: true },
      });

      // 2. Crear el registro de transferencia vinculando ambos movimientos
      const transfer = await tx.transfer.create({
        data: {
          organizationId: input.organizationId,
          fromBankAccountId: input.fromBankAccountId,
          toBankAccountId: input.toBankAccountId,
          branchId: input.branchId,
          outgoingMovementId: outgoingMovement.id,
          incomingMovementId: incomingMovement.id,
          initiatedById: input.initiatedById,
          approvedById: input.approvedById,
          status: effectiveStatus,
          amount: input.amount,
          currencyCode: input.currencyCode ?? 'MXN',
          occurredAt: new Date(input.occurredAt),
          description: input.description,
          reference: input.reference,
        },
        select: TRANSFER_SELECT,
      });

      // 3. Actualizar saldos de ambas cuentas si está contabilizado
      if (effectiveStatus === TransferStatus.POSTED) {
        const amount = new Prisma.Decimal(input.amount);
        await tx.bankAccount.update({
          where: { id: input.fromBankAccountId },
          data: { currentBalance: { decrement: amount } },
        });
        await tx.bankAccount.update({
          where: { id: input.toBankAccountId },
          data: { currentBalance: { increment: amount } },
        });
      }

      return transfer;
    });

    await this.auditService.auditAction({
      organizationId: created.organizationId,
      actorId: input.initiatedById ?? input.approvedById,
      action: 'FINANCIAL_TRANSFER_CREATED',
      entityType: 'financial_transfer',
      entityId: created.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        fromBankAccountId: created.fromBankAccountId,
        toBankAccountId: created.toBankAccountId,
        outgoingMovementId: created.outgoingMovementId,
        incomingMovementId: created.incomingMovementId,
        status: created.status,
        amount: created.amount.toString(),
        currencyCode: created.currencyCode,
      },
    });

    this.logger.log(
      JSON.stringify({
        event: 'TRANSFER_CREATED',
        transferId: created.id,
        fromAccountId: created.fromBankAccountId,
        toAccountId: created.toBankAccountId,
      }),
    );

    const transferPayload: TransferPostingPayload = {
      eventType: 'transfer.completed',
      tenantId: created.organizationId,
      transferId: created.id,
      amount: Number(created.amount),
      currency: created.currencyCode,
      sourceAccountId: created.fromBankAccountId,
      destinationAccountId: created.toBankAccountId,
      transferDate: created.occurredAt,
      userId: created.initiatedById ?? created.approvedById ?? '',
    };
    this.eventEmitter.emit(ACCOUNTING_EVENTS.TRANSFER_COMPLETED, transferPayload);

    return created;
  }

  async findAll(query: ListTransfersQueryDto): Promise<TransferSummary[]> {
    const where: Prisma.TransferWhereInput = {
      deletedAt: null,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.fromBankAccountId ? { fromBankAccountId: query.fromBankAccountId } : {}),
      ...(query.toBankAccountId ? { toBankAccountId: query.toBankAccountId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            occurredAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    return this.prisma.transfer.findMany({
      where,
      select: TRANSFER_SELECT,
      orderBy: [{ occurredAt: 'desc' }, { id: 'asc' }],
      ...(query.limit ? { take: query.limit } : {}),
    });
  }

  async findOneById(id: string): Promise<TransferSummary | null> {
    return this.prisma.transfer.findFirst({
      where: { id, deletedAt: null },
      select: TRANSFER_SELECT,
    });
  }

  async update(id: string, input: UpdateTransferDto): Promise<TransferSummary | null> {
    const existing = await this.prisma.transfer.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Prisma.TransferUncheckedUpdateInput = {
      ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
      ...(input.outgoingMovementId !== undefined
        ? { outgoingMovementId: input.outgoingMovementId }
        : {}),
      ...(input.incomingMovementId !== undefined
        ? { incomingMovementId: input.incomingMovementId }
        : {}),
      ...(input.initiatedById !== undefined ? { initiatedById: input.initiatedById } : {}),
      ...(input.approvedById !== undefined ? { approvedById: input.approvedById } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.currencyCode !== undefined ? { currencyCode: input.currencyCode } : {}),
      ...(input.occurredAt !== undefined ? { occurredAt: new Date(input.occurredAt) } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.reference !== undefined ? { reference: input.reference } : {}),
    };

    const updated = await this.prisma.transfer.update({
      where: { id },
      data,
      select: TRANSFER_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      actorId: input.initiatedById ?? input.approvedById,
      action: 'FINANCIAL_TRANSFER_UPDATED',
      entityType: 'financial_transfer',
      entityId: updated.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        status: updated.status,
        amount: updated.amount.toString(),
        currencyCode: updated.currencyCode,
        occurredAt: updated.occurredAt.toISOString(),
      },
    });

    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    const existing = await this.prisma.transfer.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        fromBankAccountId: true,
        toBankAccountId: true,
        outgoingMovementId: true,
        incomingMovementId: true,
        amount: true,
        status: true,
      },
    });

    if (!existing) {
      return false;
    }

    const deleted = await this.prisma.$transaction(async (tx) => {
      const result = await tx.transfer.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      if (result.count > 0) {
        // Soft-delete los movimientos espejo
        const now = new Date();
        if (existing.outgoingMovementId) {
          await tx.financialMovement.updateMany({
            where: { id: existing.outgoingMovementId, deletedAt: null },
            data: { deletedAt: now },
          });
        }
        if (existing.incomingMovementId) {
          await tx.financialMovement.updateMany({
            where: { id: existing.incomingMovementId, deletedAt: null },
            data: { deletedAt: now },
          });
        }

        // Revertir saldos si estaba contabilizado
        if (existing.status === TransferStatus.POSTED) {
          const amount = new Prisma.Decimal(existing.amount);
          await tx.bankAccount.update({
            where: { id: existing.fromBankAccountId },
            data: { currentBalance: { increment: amount } },
          });
          await tx.bankAccount.update({
            where: { id: existing.toBankAccountId },
            data: { currentBalance: { decrement: amount } },
          });
        }
      }

      return result;
    });

    if (deleted.count > 0) {
      await this.auditService.auditAction({
        organizationId: existing.organizationId,
        action: 'FINANCIAL_TRANSFER_DELETED',
        entityType: 'financial_transfer',
        entityId: existing.id,
        origin: SourceType.API,
        result: 'SUCCESS',
      });
    }

    return deleted.count > 0;
  }
}
