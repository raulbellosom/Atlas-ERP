import { Injectable } from '@nestjs/common';
import { CounterpartyStatus, CounterpartyType, Prisma, SourceType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCounterpartyLiteDto } from './dto/create-counterparty-lite.dto';
import { UpdateCounterpartyLiteDto } from './dto/update-counterparty-lite.dto';
import { ListCounterpartiesLiteQueryDto } from './dto/list-counterparties-lite.query.dto';

const COUNTERPARTY_SELECT = {
  id: true,
  organizationId: true,
  branchId: true,
  createdById: true,
  type: true,
  status: true,
  name: true,
  displayName: true,
  taxId: true,
  email: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CounterpartyLiteSelect;

type CounterpartySummary = Prisma.CounterpartyLiteGetPayload<{
  select: typeof COUNTERPARTY_SELECT;
}>;

@Injectable()
export class CounterpartiesLiteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(input: CreateCounterpartyLiteDto): Promise<CounterpartySummary> {
    const created = await this.prisma.counterpartyLite.create({
      data: {
        organizationId: input.organizationId,
        branchId: input.branchId,
        createdById: input.createdById,
        name: input.name,
        displayName: input.displayName,
        type: input.type ?? CounterpartyType.OTHER,
        status: input.status ?? CounterpartyStatus.ACTIVE,
        taxId: input.taxId,
        email: input.email,
        phone: input.phone,
      },
      select: COUNTERPARTY_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: created.organizationId,
      actorId: input.createdById,
      action: 'COUNTERPARTY_CREATED',
      entityType: 'counterparty_lite',
      entityId: created.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        status: created.status,
        type: created.type,
      },
    });

    return created;
  }

  async findAll(query: ListCounterpartiesLiteQueryDto): Promise<CounterpartySummary[]> {
    const where: Prisma.CounterpartyLiteWhereInput = {
      deletedAt: null,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { displayName: { contains: query.search, mode: 'insensitive' } },
              { taxId: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.counterpartyLite.findMany({
      where,
      select: COUNTERPARTY_SELECT,
      orderBy: { name: 'asc' },
      ...(query.limit ? { take: query.limit } : {}),
    });
  }

  async findOneById(id: string): Promise<CounterpartySummary | null> {
    return this.prisma.counterpartyLite.findFirst({
      where: { id, deletedAt: null },
      select: COUNTERPARTY_SELECT,
    });
  }

  async update(id: string, input: UpdateCounterpartyLiteDto): Promise<CounterpartySummary | null> {
    const existing = await this.prisma.counterpartyLite.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const updated = await this.prisma.counterpartyLite.update({
      where: { id },
      data: {
        ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.taxId !== undefined ? { taxId: input.taxId } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
      },
      select: COUNTERPARTY_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      action: 'COUNTERPARTY_UPDATED',
      entityType: 'counterparty_lite',
      entityId: updated.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        status: updated.status,
        type: updated.type,
      },
    });

    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    const existing = await this.prisma.counterpartyLite.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!existing) {
      return false;
    }

    const result = await this.prisma.counterpartyLite.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count > 0) {
      await this.auditService.auditAction({
        organizationId: existing.organizationId,
        action: 'COUNTERPARTY_DELETED',
        entityType: 'counterparty_lite',
        entityId: existing.id,
        origin: SourceType.API,
        result: 'SUCCESS',
      });
    }

    return result.count > 0;
  }
}
