import { Injectable } from '@nestjs/common';
import { Prisma, ReceivableStatus, SourceType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateReceivableLiteDto } from './dto/create-receivable-lite.dto';
import { ListReceivablesLiteQueryDto } from './dto/list-receivables-lite.query.dto';
import { UpdateReceivableLiteDto } from './dto/update-receivable-lite.dto';

const RECEIVABLE_SELECT = {
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
} satisfies Prisma.ReceivableLiteSelect;

type ReceivableSummary = Prisma.ReceivableLiteGetPayload<{
  select: typeof RECEIVABLE_SELECT;
}>;

@Injectable()
export class ReceivablesLiteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(input: CreateReceivableLiteDto): Promise<ReceivableSummary> {
    const created = await this.prisma.receivableLite.create({
      data: {
        organizationId: input.organizationId,
        branchId: input.branchId,
        counterpartyId: input.counterpartyId,
        bankAccountId: input.bankAccountId,
        createdById: input.createdById,
        status: input.status ?? ReceivableStatus.OPEN,
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
      select: RECEIVABLE_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: created.organizationId,
      actorId: input.createdById,
      action: 'RECEIVABLE_CREATED',
      entityType: 'receivable_lite',
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

  async findAll(query: ListReceivablesLiteQueryDto): Promise<ReceivableSummary[]> {
    const now = new Date();
    const where: Prisma.ReceivableLiteWhereInput = {
      deletedAt: null,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.counterpartyId ? { counterpartyId: query.counterpartyId } : {}),
      ...(query.bankAccountId ? { bankAccountId: query.bankAccountId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.overdueOnly
        ? {
            dueAt: { lt: now },
            status: { in: [ReceivableStatus.OPEN, ReceivableStatus.PARTIALLY_PAID, ReceivableStatus.OVERDUE] },
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

    return this.prisma.receivableLite.findMany({
      where,
      select: RECEIVABLE_SELECT,
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      ...(query.limit ? { take: query.limit } : {}),
    });
  }

  async findOneById(id: string): Promise<ReceivableSummary | null> {
    return this.prisma.receivableLite.findFirst({
      where: { id, deletedAt: null },
      select: RECEIVABLE_SELECT,
    });
  }

  async update(
    id: string,
    input: UpdateReceivableLiteDto,
  ): Promise<ReceivableSummary | null> {
    const existing = await this.prisma.receivableLite.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Prisma.ReceivableLiteUncheckedUpdateInput = {
      ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
      ...(input.counterpartyId !== undefined
        ? { counterpartyId: input.counterpartyId }
        : {}),
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

    const updated = await this.prisma.receivableLite.update({
      where: { id },
      data,
      select: RECEIVABLE_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      action: 'RECEIVABLE_UPDATED',
      entityType: 'receivable_lite',
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
    const existing = await this.prisma.receivableLite.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!existing) {
      return false;
    }

    const result = await this.prisma.receivableLite.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count > 0) {
      await this.auditService.auditAction({
        organizationId: existing.organizationId,
        action: 'RECEIVABLE_DELETED',
        entityType: 'receivable_lite',
        entityId: existing.id,
        origin: SourceType.API,
        result: 'SUCCESS',
      });
    }

    return result.count > 0;
  }

  async countOverdueByOrganization(organizationId: string): Promise<number> {
    return this.prisma.receivableLite.count({
      where: {
        organizationId,
        deletedAt: null,
        dueAt: { lt: new Date() },
        status: {
          in: [ReceivableStatus.OPEN, ReceivableStatus.PARTIALLY_PAID, ReceivableStatus.OVERDUE],
        },
      },
    });
  }
}
