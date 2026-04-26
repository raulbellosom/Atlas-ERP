import { Injectable } from '@nestjs/common';
import {
  PayableStatus,
  Prisma,
  SourceType,
  FinancialMovementType,
  FinancialMovementStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePayableLiteDto } from './dto/create-payable-lite.dto';
import { ListPayablesLiteQueryDto } from './dto/list-payables-lite.query.dto';
import { UpdatePayableLiteDto } from './dto/update-payable-lite.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { FinancialMovementsService } from '../financial-movements/financial-movements.service';

const PAYABLE_SELECT = {
  id: true,
  organizationId: true,
  branchId: true,
  counterpartyId: true,
  bankAccountId: true,
  createdById: true,
  status: true,
  reference: true,
  externalReference: true,
  amount: true,
  amountPaid: true,
  currencyCode: true,
  issuedAt: true,
  dueAt: true,
  paidAt: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PayableLiteSelect;

type PayableSummary = Prisma.PayableLiteGetPayload<{
  select: typeof PAYABLE_SELECT;
}>;

@Injectable()
export class PayablesLiteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly financialMovementsService: FinancialMovementsService,
  ) {}

  async create(input: CreatePayableLiteDto): Promise<PayableSummary> {
    const created = await this.prisma.payableLite.create({
      data: {
        organizationId: input.organizationId,
        branchId: input.branchId,
        counterpartyId: input.counterpartyId,
        bankAccountId: input.bankAccountId,
        createdById: input.createdById,
        status: input.status ?? PayableStatus.OPEN,
        reference: input.reference,
        externalReference: input.externalReference,
        amount: input.amount,
        amountPaid: input.amountPaid ?? '0',
        currencyCode: input.currencyCode ?? 'MXN',
        issuedAt: input.issuedAt ? new Date(input.issuedAt) : undefined,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        paidAt: input.paidAt ? new Date(input.paidAt) : undefined,
        description: input.description,
      },
      select: PAYABLE_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: created.organizationId,
      actorId: input.createdById,
      action: 'PAYABLE_CREATED',
      entityType: 'payable_lite',
      entityId: created.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        status: created.status,
        amount: created.amount.toString(),
        amountPaid: created.amountPaid.toString(),
        currencyCode: created.currencyCode,
      },
    });

    return created;
  }

  async findAll(query: ListPayablesLiteQueryDto): Promise<PayableSummary[]> {
    const now = new Date();
    const where: Prisma.PayableLiteWhereInput = {
      deletedAt: null,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.counterpartyId ? { counterpartyId: query.counterpartyId } : {}),
      ...(query.bankAccountId ? { bankAccountId: query.bankAccountId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.overdueOnly
        ? {
            dueAt: { lt: now },
            status: {
              in: [PayableStatus.OPEN, PayableStatus.PARTIALLY_PAID, PayableStatus.OVERDUE],
            },
          }
        : {}),
      ...(query.dueFrom || query.dueTo
        ? {
            dueAt: {
              ...(query.dueFrom ? { gte: new Date(query.dueFrom) } : {}),
              ...(query.dueTo ? { lte: new Date(query.dueTo) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { reference: { contains: query.search, mode: 'insensitive' } },
              { externalReference: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.payableLite.findMany({
      where,
      select: PAYABLE_SELECT,
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      ...(query.limit ? { take: query.limit } : {}),
    });
  }

  async findOneById(id: string): Promise<PayableSummary | null> {
    return this.prisma.payableLite.findFirst({
      where: { id, deletedAt: null },
      select: PAYABLE_SELECT,
    });
  }

  async update(id: string, input: UpdatePayableLiteDto): Promise<PayableSummary | null> {
    const existing = await this.prisma.payableLite.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Prisma.PayableLiteUncheckedUpdateInput = {
      ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
      ...(input.counterpartyId !== undefined ? { counterpartyId: input.counterpartyId } : {}),
      ...(input.bankAccountId !== undefined ? { bankAccountId: input.bankAccountId } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.reference !== undefined ? { reference: input.reference } : {}),
      ...(input.externalReference !== undefined
        ? { externalReference: input.externalReference }
        : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.amountPaid !== undefined ? { amountPaid: input.amountPaid } : {}),
      ...(input.currencyCode !== undefined ? { currencyCode: input.currencyCode } : {}),
      ...(input.issuedAt !== undefined ? { issuedAt: new Date(input.issuedAt) } : {}),
      ...(input.dueAt !== undefined ? { dueAt: new Date(input.dueAt) } : {}),
      ...(input.paidAt !== undefined ? { paidAt: new Date(input.paidAt) } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    };

    const updated = await this.prisma.payableLite.update({
      where: { id },
      data,
      select: PAYABLE_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      action: 'PAYABLE_UPDATED',
      entityType: 'payable_lite',
      entityId: updated.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        status: updated.status,
        amount: updated.amount.toString(),
        amountPaid: updated.amountPaid.toString(),
      },
    });

    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    const existing = await this.prisma.payableLite.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!existing) {
      return false;
    }

    const result = await this.prisma.payableLite.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count > 0) {
      await this.auditService.auditAction({
        organizationId: existing.organizationId,
        action: 'PAYABLE_DELETED',
        entityType: 'payable_lite',
        entityId: existing.id,
        origin: SourceType.API,
        result: 'SUCCESS',
      });
    }

    return result.count > 0;
  }

  async countOverdueByOrganization(organizationId: string): Promise<number> {
    return this.prisma.payableLite.count({
      where: {
        organizationId,
        deletedAt: null,
        dueAt: { lt: new Date() },
        status: {
          in: [PayableStatus.OPEN, PayableStatus.PARTIALLY_PAID, PayableStatus.OVERDUE],
        },
      },
    });
  }

  async registerPayment(
    id: string,
    input: RegisterPaymentDto,
    userId?: string,
  ): Promise<PayableSummary | null> {
    const existing = await this.prisma.payableLite.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        amount: true,
        amountPaid: true,
        currencyCode: true,
        reference: true,
        status: true,
      },
    });

    if (!existing) {
      return null;
    }

    if (existing.status === PayableStatus.PAID || existing.status === PayableStatus.CANCELED) {
      throw new Error('No se puede registrar pago en una cuenta ya pagada o cancelada');
    }

    const paymentAmount = new Prisma.Decimal(input.amount);
    const newAmountPaid = existing.amountPaid.add(paymentAmount);

    let newStatus: any = existing.status;
    if (newAmountPaid.gte(existing.amount)) {
      newStatus = 'PAID' as PayableStatus;
    } else if (newAmountPaid.gt(0)) {
      newStatus = PayableStatus.PARTIALLY_PAID;
    }

    // Actualizar el PayableLite
    const updated = await this.prisma.payableLite.update({
      where: { id },
      data: {
        amountPaid: newAmountPaid,
        status: newStatus as any,
        paidAt: newStatus === ('PAID' as any) ? new Date(input.occurredAt) : undefined,
      },
      select: PAYABLE_SELECT,
    });

    // Crear el FinancialMovement asociado (EXPENSE)
    // Se usa el servicio para que también afecte el saldo de la cuenta
    await this.financialMovementsService.create({
      organizationId: existing.organizationId,
      bankAccountId: input.bankAccountId,
      branchId: existing.branchId ?? undefined,
      createdById: userId,
      movementType: FinancialMovementType.EXPENSE,
      status: FinancialMovementStatus.POSTED,
      amount: input.amount,
      currencyCode: existing.currencyCode,
      occurredAt: input.occurredAt,
      description: `Pago a CxP ${existing.reference ?? existing.id}`,
      reference: existing.reference ?? undefined,
      categoryCode: 'PAYABLE_PAYMENT',
    });

    await this.auditService.auditAction({
      organizationId: existing.organizationId,
      actorId: userId,
      action: 'PAYABLE_PAYMENT_REGISTERED',
      entityType: 'payable_lite',
      entityId: existing.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        status: newStatus,
        amountPaid: newAmountPaid.toString(),
        paymentAmount: paymentAmount.toString(),
      },
    });

    return updated;
  }
}
