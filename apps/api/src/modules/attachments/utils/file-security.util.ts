import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { AppException, ErrorCode } from '../../../common/errors';
import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
} from '../constants/file-policy.constants';

interface UploadContext {
  organizationId: string;
  entityType: string;
  entityId: string;
}

export function validateIncomingFile(
  file: Express.Multer.File | undefined,
): asserts file is Express.Multer.File {
  if (!file) {
    throw new AppException({
      statusCode: 400,
      code: ErrorCode.BAD_REQUEST,
      message: 'Archivo requerido en campo "file".',
      error: 'Bad Request',
    });
  }

  if (file.size <= 0) {
    throw new AppException({
      statusCode: 400,
      code: ErrorCode.BAD_REQUEST,
      message: 'El archivo no contiene datos.',
      error: 'Bad Request',
    });
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new AppException({
      statusCode: 400,
      code: ErrorCode.FILE_TOO_LARGE,
      message: 'El archivo supera el límite de 20 MB.',
      error: 'Bad Request',
      details: {
        sizeBytes: file.size,
        maxBytes: MAX_ATTACHMENT_SIZE_BYTES,
      },
    });
  }

  if (
    !ALLOWED_ATTACHMENT_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number],
    )
  ) {
    throw new AppException({
      statusCode: 400,
      code: ErrorCode.FILE_TYPE_NOT_ALLOWED,
      message: 'Tipo MIME no permitido para adjuntos.',
      error: 'Bad Request',
      details: {
        mimeType: file.mimetype,
        allowed: ALLOWED_ATTACHMENT_MIME_TYPES,
      },
    });
  }

  const extension = extname(file.originalname).toLowerCase();
  if (
    !ALLOWED_ATTACHMENT_EXTENSIONS.includes(
      extension as (typeof ALLOWED_ATTACHMENT_EXTENSIONS)[number],
    )
  ) {
    throw new AppException({
      statusCode: 400,
      code: ErrorCode.FILE_EXTENSION_NOT_ALLOWED,
      message: 'Extensión de archivo no permitida.',
      error: 'Bad Request',
      details: {
        extension,
        allowed: ALLOWED_ATTACHMENT_EXTENSIONS,
      },
    });
  }
}

export function buildStorageObjectKey(
  file: Express.Multer.File,
  context: UploadContext,
): string {
  const extension = extname(file.originalname).toLowerCase();
  const safeFilename = sanitizeFilename(file.originalname.replace(extension, ''));
  const safeEntityType = sanitizePathSegment(context.entityType);
  const safeEntityId = sanitizePathSegment(context.entityId);
  const safeOrganizationId = sanitizePathSegment(context.organizationId);
  const fileToken = randomUUID();

  return [
    'uploads',
    safeOrganizationId,
    safeEntityType,
    safeEntityId,
    `${fileToken}-${safeFilename}${extension}`,
  ].join('/');
}

export function sanitizeFilename(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[^\w\s.-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  if (!normalized) {
    return 'archivo';
  }

  return normalized.slice(0, 120);
}

function sanitizePathSegment(value: string): string {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  if (!normalized) {
    return 'na';
  }

  return normalized.slice(0, 80);
}
