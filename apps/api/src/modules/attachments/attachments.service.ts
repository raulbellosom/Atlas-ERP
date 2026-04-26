import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SourceType } from '@prisma/client';
import { ErrorCode } from '../../common/errors';
import { buildSoftDeleteFilter } from '../../common/query-filters';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DownloadAttachmentQueryDto } from './dto/download-attachment.query.dto';
import { ListAttachmentsQueryDto } from './dto/list-attachments.query.dto';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { buildStorageObjectKey, validateIncomingFile } from './utils/file-security.util';

const ATTACHMENT_PUBLIC_SELECT = {
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
} satisfies Prisma.AttachmentSelect;

const ATTACHMENT_INTERNAL_SELECT = {
  ...ATTACHMENT_PUBLIC_SELECT,
  storagePath: true,
} satisfies Prisma.AttachmentSelect;

type AttachmentSummary = Prisma.AttachmentGetPayload<{
  select: typeof ATTACHMENT_PUBLIC_SELECT;
}>;

type AttachmentInternal = Prisma.AttachmentGetPayload<{
  select: typeof ATTACHMENT_INTERNAL_SELECT;
}>;

export interface AttachmentDownloadResponse {
  attachmentId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  expiresInSeconds: number;
  downloadUrl: string;
}

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: ListAttachmentsQueryDto): Promise<AttachmentSummary[]> {
    return this.prisma.attachment.findMany({
      where: {
        ...(query.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query.entityType ? { entityType: query.entityType } : {}),
        ...(query.entityId ? { entityId: query.entityId } : {}),
        ...(query.uploadedById ? { uploadedById: query.uploadedById } : {}),
        ...buildSoftDeleteFilter(query.includeDeleted),
      },
      select: ATTACHMENT_PUBLIC_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async findOneById(id: string): Promise<AttachmentSummary | null> {
    return this.prisma.attachment.findUnique({
      where: { id },
      select: ATTACHMENT_PUBLIC_SELECT,
    });
  }

  async update(
    id: string,
    dto: UpdateAttachmentDto,
    requesterOrganizationId?: string,
  ): Promise<AttachmentSummary> {
    const existing = await this.findOneById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Adjunto no encontrado.');
    }

    this.validateOrganizationScope(existing.organizationId, requesterOrganizationId, true);

    const updated = await this.prisma.attachment.update({
      where: { id },
      data: {
        ...(dto.filename !== undefined ? { filename: dto.filename } : {}),
      },
      select: ATTACHMENT_PUBLIC_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      action: 'FILE_UPDATED',
      entityType: 'Attachment',
      entityId: updated.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        filename: updated.filename,
      },
    });

    return updated;
  }

  async softDelete(id: string, requesterOrganizationId?: string): Promise<{ deleted: true }> {
    const existing = await this.findOneById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Adjunto no encontrado.');
    }

    this.validateOrganizationScope(existing.organizationId, requesterOrganizationId, true);

    await this.prisma.attachment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.auditAction({
      organizationId: existing.organizationId,
      action: 'FILE_DELETED',
      entityType: 'Attachment',
      entityId: id,
      origin: SourceType.API,
      result: 'SUCCESS',
    });

    return { deleted: true };
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    includeDeleted?: boolean,
  ): Promise<AttachmentSummary[]> {
    return this.prisma.attachment.findMany({
      where: {
        entityType,
        entityId,
        ...buildSoftDeleteFilter(includeDeleted),
      },
      select: ATTACHMENT_PUBLIC_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async uploadAttachment(
    dto: UploadAttachmentDto,
    file: Express.Multer.File | undefined,
    requesterOrganizationId?: string,
  ): Promise<AttachmentSummary> {
    this.validateOrganizationScope(dto.organizationId, requesterOrganizationId, true);
    validateIncomingFile(file);

    const objectKey = buildStorageObjectKey(file, {
      organizationId: dto.organizationId,
      entityType: dto.entityType,
      entityId: dto.entityId,
    });

    await this.storageService.uploadObject({
      objectName: objectKey,
      data: file.buffer,
      mimeType: file.mimetype,
    });

    const attachment = await this.prisma.attachment.create({
      data: {
        organizationId: dto.organizationId,
        filename: file.originalname,
        storagePath: objectKey,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        entityType: dto.entityType,
        entityId: dto.entityId,
        uploadedById: dto.uploadedById ?? null,
      },
      select: ATTACHMENT_PUBLIC_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: dto.organizationId,
      actorId: dto.uploadedById ?? undefined,
      action: 'FILE_UPLOADED',
      entityType: 'Attachment',
      entityId: attachment.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });

    return attachment;
  }

  async generateSecureDownload(
    attachmentId: string,
    query: DownloadAttachmentQueryDto,
    requesterOrganizationId?: string,
  ): Promise<AttachmentDownloadResponse> {
    const attachment = await this.findInternalAttachmentById(attachmentId);
    if (!attachment || attachment.deletedAt) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.FILE_NOT_FOUND,
        message: 'Adjunto no encontrado o no disponible.',
        error: 'Not Found',
      });
    }

    this.validateOrganizationScope(attachment.organizationId, requesterOrganizationId, true);

    const exists = await this.storageService.objectExists(attachment.storagePath);
    if (!exists) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.FILE_NOT_FOUND,
        message: 'El archivo físico no existe en almacenamiento.',
        error: 'Not Found',
      });
    }

    const expiresInSeconds =
      query.expiresInSeconds ?? this.storageService.getDefaultPresignedExpirySeconds();
    const downloadUrl = await this.storageService.generatePresignedGetUrl(
      attachment.storagePath,
      expiresInSeconds,
    );

    return {
      attachmentId: attachment.id,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      expiresInSeconds,
      downloadUrl,
    };
  }

  private async findInternalAttachmentById(id: string): Promise<AttachmentInternal | null> {
    return this.prisma.attachment.findUnique({
      where: { id },
      select: ATTACHMENT_INTERNAL_SELECT,
    });
  }

  private validateOrganizationScope(
    resourceOrganizationId: string,
    requesterOrganizationId?: string,
    requireRequesterScope = false,
  ): void {
    if (!requesterOrganizationId) {
      if (requireRequesterScope) {
        throw new ForbiddenException({
          statusCode: 403,
          code: ErrorCode.FILE_SCOPE_MISMATCH,
          message: 'Se requiere contexto de organización para acceder al adjunto.',
          error: 'Forbidden',
        });
      }
      return;
    }

    if (requesterOrganizationId !== resourceOrganizationId) {
      throw new ForbiddenException({
        statusCode: 403,
        code: ErrorCode.FILE_SCOPE_MISMATCH,
        message: 'La organización del solicitante no coincide con la del adjunto.',
        error: 'Forbidden',
      });
    }
  }
}
