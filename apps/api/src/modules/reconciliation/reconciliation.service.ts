import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Prisma,
  ReconciliationItemStatus,
  ReconciliationSessionStatus,
  SourceType,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CloseReconciliationSessionDto } from './dto/close-reconciliation-session.dto';
import { CreateReconciliationItemDto } from './dto/create-reconciliation-item.dto';
import { CreateReconciliationSessionDto } from './dto/create-reconciliation-session.dto';
import { ListReconciliationItemsQueryDto } from './dto/list-reconciliation-items.query.dto';
import { ListReconciliationSessionsQueryDto } from './dto/list-reconciliation-sessions.query.dto';
import { ReconcileSessionDto } from './dto/reconcile-session.dto';
import { UpdateReconciliationItemDto } from './dto/update-reconciliation-item.dto';
import { UpdateReconciliationSessionDto } from './dto/update-reconciliation-session.dto';

const RECONCILIATION_SESSION_SELECT = {
  id: true,
  organizationId: true,
  bankAccountId: true,
  branchId: true,
  openedById: true,
  closedById: true,
  status: true,
  startedAt: true,
  closedAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ReconciliationSessionSelect;

const RECONCILIATION_ITEM_SELECT = {
  id: true,
  organizationId: true,
  reconciliationSessionId: true,
  financialMovementId: true,
  branchId: true,
  status: true,
  expectedAmount: true,
  actualAmount: true,
  discrepancyAmount: true,
  reason: true,
  resolvedById: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ReconciliationItemSelect;

type ReconciliationSessionSummary = Prisma.ReconciliationSessionGetPayload<{
  select: typeof RECONCILIATION_SESSION_SELECT;
}>;

type ReconciliationItemSummary = Prisma.ReconciliationItemGetPayload<{
  select: typeof RECONCILIATION_ITEM_SELECT;
}>;

type ReconcileSessionResult = {
  sessionId: string;
  processedItems: number;
  matchedItems: number;
  discrepancyItems: number;
  resolvedItems: number;
  pendingItems: number;
  updatedAt: string;
};

type CloseSessionResult = ReconciliationSessionSummary & {
  metrics: {
    totalItems: number;
    pendingItems: number;
    discrepancyItems: number;
    matchedItems: number;
    resolvedItems: number;
    ignoredItems: number;
  };
};

@Injectable()
export class ReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createSession(
    input: CreateReconciliationSessionDto,
  ): Promise<ReconciliationSessionSummary> {
    const created = await this.prisma.reconciliationSession.create({
      data: {
        organizationId: input.organizationId,
        bankAccountId: input.bankAccountId,
        branchId: input.branchId,
        openedById: input.openedById,
        closedById: input.closedById,
        status: input.status,
        startedAt: input.startedAt ? new Date(input.startedAt) : undefined,
        closedAt: input.closedAt ? new Date(input.closedAt) : undefined,
        notes: input.notes,
      },
      select: RECONCILIATION_SESSION_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: created.organizationId,
      actorId: input.openedById,
      action: 'RECONCILIATION_SESSION_CREATED',
      entityType: 'reconciliation_session',
      entityId: created.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        bankAccountId: created.bankAccountId,
        status: created.status,
        startedAt: created.startedAt.toISOString(),
      },
    });

    return created;
  }

  async findSessions(
    query: ListReconciliationSessionsQueryDto,
  ): Promise<ReconciliationSessionSummary[]> {
    const where: Prisma.ReconciliationSessionWhereInput = {
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.bankAccountId ? { bankAccountId: query.bankAccountId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            startedAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    return this.prisma.reconciliationSession.findMany({
      where,
      select: RECONCILIATION_SESSION_SELECT,
      orderBy: [{ startedAt: 'desc' }, { id: 'asc' }],
      ...(query.limit ? { take: query.limit } : {}),
    });
  }

  async findSessionById(id: string): Promise<ReconciliationSessionSummary | null> {
    return this.prisma.reconciliationSession.findUnique({
      where: { id },
      select: RECONCILIATION_SESSION_SELECT,
    });
  }

  async updateSession(
    id: string,
    input: UpdateReconciliationSessionDto,
  ): Promise<ReconciliationSessionSummary | null> {
    const existing = await this.prisma.reconciliationSession.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Prisma.ReconciliationSessionUncheckedUpdateInput = {
      ...(input.bankAccountId !== undefined
        ? { bankAccountId: input.bankAccountId }
        : {}),
      ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
      ...(input.openedById !== undefined ? { openedById: input.openedById } : {}),
      ...(input.closedById !== undefined ? { closedById: input.closedById } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.startedAt !== undefined ? { startedAt: new Date(input.startedAt) } : {}),
      ...(input.closedAt !== undefined ? { closedAt: new Date(input.closedAt) } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    };

    return this.prisma.reconciliationSession.update({
      where: { id },
      data,
      select: RECONCILIATION_SESSION_SELECT,
    });
  }

  async createItem(
    input: CreateReconciliationItemDto,
  ): Promise<ReconciliationItemSummary> {
    return this.prisma.reconciliationItem.create({
      data: {
        organizationId: input.organizationId,
        reconciliationSessionId: input.reconciliationSessionId,
        financialMovementId: input.financialMovementId,
        branchId: input.branchId,
        status: input.status,
        expectedAmount: input.expectedAmount,
        actualAmount: input.actualAmount,
        discrepancyAmount: input.discrepancyAmount,
        reason: input.reason,
        resolvedById: input.resolvedById,
        resolvedAt: input.resolvedAt ? new Date(input.resolvedAt) : undefined,
      },
      select: RECONCILIATION_ITEM_SELECT,
    });
  }

  async findSessionItems(
    sessionId: string,
    query: ListReconciliationItemsQueryDto,
  ): Promise<ReconciliationItemSummary[]> {
    const where: Prisma.ReconciliationItemWhereInput = {
      reconciliationSessionId: sessionId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.resolvedOnly ? { resolvedAt: { not: null } } : {}),
    };

    return this.prisma.reconciliationItem.findMany({
      where,
      select: RECONCILIATION_ITEM_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      ...(query.limit ? { take: query.limit } : {}),
    });
  }

  async updateItem(
    id: string,
    input: UpdateReconciliationItemDto,
  ): Promise<ReconciliationItemSummary | null> {
    const existing = await this.prisma.reconciliationItem.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Prisma.ReconciliationItemUncheckedUpdateInput = {
      ...(input.financialMovementId !== undefined
        ? { financialMovementId: input.financialMovementId }
        : {}),
      ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.expectedAmount !== undefined ? { expectedAmount: input.expectedAmount } : {}),
      ...(input.actualAmount !== undefined ? { actualAmount: input.actualAmount } : {}),
      ...(input.discrepancyAmount !== undefined
        ? { discrepancyAmount: input.discrepancyAmount }
        : {}),
      ...(input.reason !== undefined ? { reason: input.reason } : {}),
      ...(input.resolvedById !== undefined ? { resolvedById: input.resolvedById } : {}),
      ...(input.resolvedAt !== undefined ? { resolvedAt: new Date(input.resolvedAt) } : {}),
    };

    return this.prisma.reconciliationItem.update({
      where: { id },
      data,
      select: RECONCILIATION_ITEM_SELECT,
    });
  }

  async reconcileSession(
    sessionId: string,
    input: ReconcileSessionDto,
  ): Promise<ReconcileSessionResult | null> {
    const session = await this.prisma.reconciliationSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        organizationId: true,
        items: {
          select: {
            id: true,
            expectedAmount: true,
            actualAmount: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    const now = new Date();
    const updates: Prisma.PrismaPromise<unknown>[] = [];
    let processedItems = 0;
    let matchedItems = 0;
    let discrepancyItems = 0;
    let resolvedItems = 0;
    let pendingItems = 0;

    for (const item of session.items) {
      if (!item.expectedAmount || !item.actualAmount) {
        pendingItems += 1;
        continue;
      }

      processedItems += 1;
      const discrepancyAmount = item.actualAmount.minus(item.expectedAmount);
      const isMatch = discrepancyAmount.equals(new Prisma.Decimal(0));

      if (isMatch) {
        matchedItems += 1;
        updates.push(
          this.prisma.reconciliationItem.update({
            where: { id: item.id },
            data: {
              status: ReconciliationItemStatus.MATCHED,
              discrepancyAmount: '0',
              reason: null,
              resolvedById: null,
              resolvedAt: null,
            },
          }),
        );
        continue;
      }

      if (input.autoResolveDiscrepancies) {
        resolvedItems += 1;
        updates.push(
          this.prisma.reconciliationItem.update({
            where: { id: item.id },
            data: {
              status: ReconciliationItemStatus.RESOLVED,
              discrepancyAmount: discrepancyAmount.toString(),
              reason: input.reason ?? 'Discrepancia resuelta automáticamente.',
              resolvedById: input.resolvedById,
              resolvedAt: now,
            },
          }),
        );
        continue;
      }

      discrepancyItems += 1;
      updates.push(
        this.prisma.reconciliationItem.update({
          where: { id: item.id },
          data: {
            status: ReconciliationItemStatus.DISCREPANCY,
            discrepancyAmount: discrepancyAmount.toString(),
            reason: input.reason ?? null,
            resolvedById: null,
            resolvedAt: null,
          },
        }),
      );
    }

    if (updates.length > 0) {
      await this.prisma.$transaction(updates);
    }

    const result = {
      sessionId: session.id,
      processedItems,
      matchedItems,
      discrepancyItems,
      resolvedItems,
      pendingItems,
      updatedAt: now.toISOString(),
    };

    await this.auditService.auditAction({
      organizationId: session.organizationId,
      actorId: input.resolvedById,
      action: 'RECONCILIATION_SESSION_RECONCILED',
      entityType: 'reconciliation_session',
      entityId: session.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      metadata: {
        processedItems,
        matchedItems,
        discrepancyItems,
        resolvedItems,
        pendingItems,
        autoResolveDiscrepancies: input.autoResolveDiscrepancies ?? false,
      },
    });

    return result;
  }

  async closeSession(
    sessionId: string,
    input: CloseReconciliationSessionDto,
  ): Promise<CloseSessionResult | null> {
    const session = await this.prisma.reconciliationSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        items: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    const pendingItems = session.items.filter(
      (item) => item.status === ReconciliationItemStatus.PENDING,
    ).length;
    const discrepancyItems = session.items.filter(
      (item) => item.status === ReconciliationItemStatus.DISCREPANCY,
    ).length;
    const matchedItems = session.items.filter(
      (item) => item.status === ReconciliationItemStatus.MATCHED,
    ).length;
    const resolvedItems = session.items.filter(
      (item) => item.status === ReconciliationItemStatus.RESOLVED,
    ).length;
    const ignoredItems = session.items.filter(
      (item) => item.status === ReconciliationItemStatus.IGNORED,
    ).length;

    if (!input.force && (pendingItems > 0 || discrepancyItems > 0)) {
      throw new BadRequestException(
        'No se puede cerrar la conciliación con partidas pendientes o con discrepancias.',
      );
    }

    const updated = await this.prisma.reconciliationSession.update({
      where: { id: session.id },
      data: {
        status: ReconciliationSessionStatus.CLOSED,
        closedAt: new Date(),
        ...(input.closedById !== undefined ? { closedById: input.closedById } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
      select: RECONCILIATION_SESSION_SELECT,
    });

    const result = {
      ...updated,
      metrics: {
        totalItems: session.items.length,
        pendingItems,
        discrepancyItems,
        matchedItems,
        resolvedItems,
        ignoredItems,
      },
    };

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      actorId: input.closedById,
      action: 'RECONCILIATION_SESSION_CLOSED',
      entityType: 'reconciliation_session',
      entityId: updated.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      metadata: {
        force: input.force ?? false,
        ...result.metrics,
      },
    });

    return result;
  }
}
