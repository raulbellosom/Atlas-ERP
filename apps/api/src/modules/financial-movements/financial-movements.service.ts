import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FinancialMovementStatus, Prisma, SourceType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { AuditService } from '../audit/audit.service';
import {
  ACCOUNTING_EVENTS,
  FinancialPostingPayload,
} from '../accounting/events/financial-posting.payload';
import { CreateFinancialMovementDto } from './dto/create-financial-movement.dto';
import { ListFinancialMovementsQueryDto } from './dto/list-financial-movements.query.dto';
import { UploadMovementAttachmentDto } from './dto/upload-movement-attachment.dto';
import { UpdateMovementAttachmentDto } from './dto/update-movement-attachment.dto';
import { UpdateFinancialMovementDto } from './dto/update-financial-movement.dto';

const FINANCIAL_MOVEMENT_SELECT = {
  id: true,
  organizationId: true,
  bankAccountId: true,
  branchId: true,
  createdById: true,
  movementType: true,
  status: true,
  amount: true,
  currencyCode: true,
  occurredAt: true,
  description: true,
  reference: true,
  isReconciled: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FinancialMovementSelect;

type FinancialMovementSummary = Prisma.FinancialMovementGetPayload<{
  select: typeof FINANCIAL_MOVEMENT_SELECT;
}>;

@Injectable()
export class FinancialMovementsService {
  private readonly logger = new Logger(FinancialMovementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly attachmentsService: AttachmentsService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(input: CreateFinancialMovementDto): Promise<FinancialMovementSummary> {
    const created = await this.prisma.financialMovement.create({
      data: {
        organizationId: input.organizationId,
        bankAccountId: input.bankAccountId,
        branchId: input.branchId,
        createdById: input.createdById,
        movementType: input.movementType,
        status: input.status ?? FinancialMovementStatus.POSTED,
        amount: input.amount,
        currencyCode: input.currencyCode ?? 'MXN',
        occurredAt: new Date(input.occurredAt),
        description: input.description,
        reference: input.reference,
        categoryCode: input.categoryCode,
        isReconciled: input.isReconciled ?? false,
      },
      select: FINANCIAL_MOVEMENT_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: created.organizationId,
      actorId: input.createdById,
      action: 'FINANCIAL_MOVEMENT_CREATED',
      entityType: 'financial_movement',
      entityId: created.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        bankAccountId: created.bankAccountId,
        movementType: created.movementType,
        status: created.status,
        amount: created.amount.toString(),
        currencyCode: created.currencyCode,
      },
    });

    this.logger.log(
      JSON.stringify({
        event: 'MOVEMENT_CREATED',
        movementId: created.id,
        type: created.movementType,
        accountId: created.bankAccountId,
      }),
    );

    const eventPayload: FinancialPostingPayload = {
      eventType: 'financial.movement.created',
      tenantId: created.organizationId,
      movementId: created.id,
      amount: Number(created.amount),
      currency: created.currencyCode,
      bankAccountId: created.bankAccountId,
      categoryCode: input.categoryCode ?? created.movementType,
      movementDate: created.occurredAt,
      description: created.description ?? '',
      userId: input.createdById ?? '',
    };
    this.eventEmitter.emit(ACCOUNTING_EVENTS.FINANCIAL_MOVEMENT_CREATED, eventPayload);

    return created;
  }

  async findAll(query: ListFinancialMovementsQueryDto): Promise<FinancialMovementSummary[]> {
    const where: Prisma.FinancialMovementWhereInput = {
      deletedAt: null,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.bankAccountId ? { bankAccountId: query.bankAccountId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.createdById ? { createdById: query.createdById } : {}),
      ...(query.movementType ? { movementType: query.movementType } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.isReconciled !== undefined ? { isReconciled: query.isReconciled } : {}),
      ...(query.from || query.to
        ? {
            occurredAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    return this.prisma.financialMovement.findMany({
      where,
      select: FINANCIAL_MOVEMENT_SELECT,
      orderBy: [{ occurredAt: 'desc' }, { id: 'asc' }],
      ...(query.limit ? { take: query.limit } : {}),
    });
  }

  async findOneById(id: string): Promise<FinancialMovementSummary | null> {
    return this.prisma.financialMovement.findFirst({
      where: { id, deletedAt: null },
      select: FINANCIAL_MOVEMENT_SELECT,
    });
  }

  async update(
    id: string,
    input: UpdateFinancialMovementDto,
  ): Promise<FinancialMovementSummary | null> {
    const existing = await this.prisma.financialMovement.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Prisma.FinancialMovementUncheckedUpdateInput = {
      ...(input.bankAccountId !== undefined ? { bankAccountId: input.bankAccountId } : {}),
      ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
      ...(input.movementType !== undefined ? { movementType: input.movementType } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.currencyCode !== undefined ? { currencyCode: input.currencyCode } : {}),
      ...(input.occurredAt !== undefined ? { occurredAt: new Date(input.occurredAt) } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.reference !== undefined ? { reference: input.reference } : {}),
      ...(input.isReconciled !== undefined ? { isReconciled: input.isReconciled } : {}),
    };

    const updated = await this.prisma.financialMovement.update({
      where: { id },
      data,
      select: FINANCIAL_MOVEMENT_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      action: 'FINANCIAL_MOVEMENT_UPDATED',
      entityType: 'financial_movement',
      entityId: updated.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        movementType: updated.movementType,
        status: updated.status,
        amount: updated.amount.toString(),
        isReconciled: updated.isReconciled,
      },
    });

    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    const existing = await this.prisma.financialMovement.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!existing) {
      return false;
    }

    const result = await this.prisma.financialMovement.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count > 0) {
      await this.auditService.auditAction({
        organizationId: existing.organizationId,
        action: 'FINANCIAL_MOVEMENT_DELETED',
        entityType: 'financial_movement',
        entityId: existing.id,
        origin: SourceType.API,
        result: 'SUCCESS',
      });
    }

    return result.count > 0;
  }

  async uploadProof(
    movementId: string,
    dto: UploadMovementAttachmentDto,
    file: Express.Multer.File | undefined,
    requesterOrganizationId?: string,
  ) {
    const movement = await this.prisma.financialMovement.findFirst({
      where: { id: movementId, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!movement) {
      throw new NotFoundException('Movimiento financiero no encontrado.');
    }

    if (dto.organizationId !== movement.organizationId) {
      throw new NotFoundException('El movimiento no pertenece a la organización enviada.');
    }

    const attachment = await this.attachmentsService.uploadAttachment(
      {
        organizationId: dto.organizationId,
        entityType: 'financial_movement',
        entityId: movementId,
        uploadedById: dto.uploadedById,
      },
      file,
      requesterOrganizationId,
    );

    const existingRelation = await this.prisma.financialMovementAttachment.findFirst({
      where: {
        organizationId: dto.organizationId,
        financialMovementId: movementId,
        attachmentId: attachment.id,
      },
      select: { id: true },
    });

    const relation =
      existingRelation ??
      (await this.prisma.financialMovementAttachment.create({
        data: {
          organizationId: dto.organizationId,
          financialMovementId: movementId,
          attachmentId: attachment.id,
          createdById: dto.uploadedById,
          note: dto.note,
        },
        select: { id: true },
      }));

    await this.auditService.auditAction({
      organizationId: dto.organizationId,
      actorId: dto.uploadedById,
      action: 'FINANCIAL_MOVEMENT_ATTACHMENT_LINKED',
      entityType: 'financial_movement',
      entityId: movementId,
      origin: SourceType.API,
      result: 'SUCCESS',
      metadata: {
        attachmentId: attachment.id,
        movementAttachmentId: relation.id,
      },
    });

    return {
      movementId,
      movementAttachmentId: relation.id,
      attachment,
    };
  }

  async listProofs(movementId: string) {
    const movement = await this.prisma.financialMovement.findFirst({
      where: { id: movementId, deletedAt: null },
      select: { id: true },
    });

    if (!movement) {
      throw new NotFoundException('Movimiento financiero no encontrado.');
    }

    return this.prisma.financialMovementAttachment.findMany({
      where: {
        financialMovementId: movementId,
        attachment: { deletedAt: null },
      },
      select: {
        id: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        attachment: {
          select: {
            id: true,
            organizationId: true,
            filename: true,
            mimeType: true,
            sizeBytes: true,
            entityType: true,
            entityId: true,
            uploadedById: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async updateProof(
    movementId: string,
    attachmentId: string,
    dto: UpdateMovementAttachmentDto,
    requesterOrganizationId?: string,
  ) {
    const movement = await this.prisma.financialMovement.findFirst({
      where: { id: movementId, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!movement) {
      throw new NotFoundException('Movimiento financiero no encontrado.');
    }

    if (requesterOrganizationId && movement.organizationId !== requesterOrganizationId) {
      throw new NotFoundException('Movimiento no encontrado.');
    }

    const existingRelation = await this.prisma.financialMovementAttachment.findFirst({
      where: {
        financialMovementId: movementId,
        attachmentId,
      },
    });

    if (!existingRelation) {
      throw new NotFoundException('Comprobante no encontrado.');
    }

    const updated = await this.prisma.financialMovementAttachment.update({
      where: { id: existingRelation.id },
      data: {
        ...(dto.note !== undefined ? { note: dto.note } : {}),
      },
    });

    await this.auditService.auditAction({
      organizationId: movement.organizationId,
      action: 'FINANCIAL_MOVEMENT_ATTACHMENT_UPDATED',
      entityType: 'financial_movement',
      entityId: movementId,
      origin: SourceType.API,
      result: 'SUCCESS',
      metadata: {
        attachmentId,
        movementAttachmentId: existingRelation.id,
        note: updated.note,
      },
    });

    return updated;
  }

  async deleteProof(movementId: string, attachmentId: string, requesterOrganizationId?: string) {
    const movement = await this.prisma.financialMovement.findFirst({
      where: { id: movementId, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!movement) {
      throw new NotFoundException('Movimiento financiero no encontrado.');
    }

    if (requesterOrganizationId && movement.organizationId !== requesterOrganizationId) {
      throw new NotFoundException('Movimiento no encontrado.');
    }

    const existingRelation = await this.prisma.financialMovementAttachment.findFirst({
      where: {
        financialMovementId: movementId,
        attachmentId,
      },
    });

    if (!existingRelation) {
      throw new NotFoundException('Comprobante no encontrado.');
    }

    await this.prisma.financialMovementAttachment.delete({
      where: { id: existingRelation.id },
    });

    await this.auditService.auditAction({
      organizationId: movement.organizationId,
      action: 'FINANCIAL_MOVEMENT_ATTACHMENT_UNLINKED',
      entityType: 'financial_movement',
      entityId: movementId,
      origin: SourceType.API,
      result: 'SUCCESS',
      metadata: {
        attachmentId,
        movementAttachmentId: existingRelation.id,
      },
    });

    return { deleted: true };
  }
}
