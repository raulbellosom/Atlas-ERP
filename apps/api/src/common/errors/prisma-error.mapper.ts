import { HttpStatus } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ErrorCode, type ErrorCodeValue } from './error-codes';

export interface MappedPrismaError {
  statusCode: number;
  code: ErrorCodeValue | string;
  message: string;
  error: string;
  details?: unknown;
}

export function mapPrismaKnownError(
  error: Prisma.PrismaClientKnownRequestError,
): MappedPrismaError {
  switch (error.code) {
    case 'P2002':
      return {
        statusCode: HttpStatus.CONFLICT,
        code: ErrorCode.PRISMA_UNIQUE_CONSTRAINT,
        message: 'Ya existe un registro con esos datos únicos.',
        error: 'Conflict',
        details: {
          target: error.meta?.['target'],
        },
      };
    case 'P2025':
      return {
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.PRISMA_RECORD_NOT_FOUND,
        message: 'El registro solicitado no existe o ya no está disponible.',
        error: 'Not Found',
      };
    case 'P2003':
      return {
        statusCode: HttpStatus.CONFLICT,
        code: ErrorCode.PRISMA_FOREIGN_KEY_CONSTRAINT,
        message: 'No se puede completar la operación por una restricción de relación.',
        error: 'Conflict',
        details: {
          field: error.meta?.['field_name'],
        },
      };
    default:
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.BAD_REQUEST,
        message: 'La operación de base de datos no pudo completarse.',
        error: 'Bad Request',
      };
  }
}
