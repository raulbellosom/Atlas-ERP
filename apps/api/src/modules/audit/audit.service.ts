import { Injectable } from '@nestjs/common';
import { Prisma, SourceType } from '@prisma/client';
import { resolvePaginationQuery, toPaginatedResult, type PaginatedResult } from '../../common/pagination';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs.query.dto';

export interface AuditActionInput {
  organizationId: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  origin: SourceType;
  result?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

const AUDIT_LOG_LIST_SELECT = {
  id: true,
  organizationId: true,
  actorId: true,
  action: true,
  entityType: true,
  entityId: true,
  origin: true,
  result: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AuditLogSelect;

const AUDIT_LOG_DETAIL_SELECT = {
  ...AUDIT_LOG_LIST_SELECT,
  before: true,
  after: true,
  metadata: true,
} satisfies Prisma.AuditLogSelect;

type AuditLogSummary = Prisma.AuditLogGetPayload<{
  select: typeof AUDIT_LOG_LIST_SELECT;
}>;

type AuditLogDetail = Prisma.AuditLogGetPayload<{
  select: typeof AUDIT_LOG_DETAIL_SELECT;
}>;

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListAuditLogsQueryDto): Promise<PaginatedResult<AuditLogSummary>> {
    const pagination = resolvePaginationQuery(query, { limit: 50, maxLimit: 100 });

    const where = {
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.actorId ? { actorId: query.actorId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.source ? { origin: query.source } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        select: AUDIT_LOG_LIST_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return toPaginatedResult(items, total, pagination);
  }

  async findOneById(id: string): Promise<AuditLogDetail | null> {
    return this.prisma.auditLog.findUnique({
      where: { id },
      select: AUDIT_LOG_DETAIL_SELECT,
    });
  }

  async auditAction(input: AuditActionInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        origin: input.origin,
        result: input.result ?? null,
        before: input.before !== undefined
          ? (input.before as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        after: input.after !== undefined
          ? (input.after as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        metadata: input.metadata !== undefined
          ? (input.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  }
}
