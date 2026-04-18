import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import {
  ErrorCode,
  mapPrismaKnownError,
  type StandardErrorResponse,
} from '../errors';

/**
 * Filtro global de excepciones para AtlasERP API.
 *
 * Formato estándar de error:
 * {
 *   statusCode: number,
 *   code: string,
 *   message: string,
 *   error: string,
 *   path: string,
 *   timestamp: string (ISO 8601),
 *   details?: unknown
 * }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const normalizedError = this.normalizeException(exception);

    if (normalizedError.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${normalizedError.statusCode} [${normalizedError.code}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${normalizedError.statusCode} [${normalizedError.code}]: ${normalizedError.message}`,
      );
    }

    response.status(normalizedError.statusCode).json({
      ...normalizedError,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeException(
    exception: unknown,
  ): Omit<StandardErrorResponse, 'path' | 'timestamp'> {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return mapPrismaKnownError(exception);
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        return {
          statusCode,
          code: this.mapStatusCodeToErrorCode(statusCode),
          message: responseBody,
          error: this.getDefaultErrorLabel(statusCode),
        };
      }

      if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as Record<string, unknown>;
        const message = this.normalizeMessage(body['message'], exception.message);
        const details = this.extractDetails(body['message'], body['details']);

        return {
          statusCode,
          code:
            typeof body['code'] === 'string'
              ? body['code']
              : this.mapStatusCodeToErrorCode(statusCode),
          message,
          error:
            typeof body['error'] === 'string'
              ? body['error']
              : this.getDefaultErrorLabel(statusCode),
          ...(details !== undefined ? { details } : {}),
        };
      }
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      };
    }

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCode.BAD_REQUEST,
      message: String(exception),
      error: 'Bad Request',
    };
  }

  private normalizeMessage(message: unknown, fallback: string): string {
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
    return fallback;
  }

  private extractDetails(
    message: unknown,
    explicitDetails: unknown,
  ): unknown | undefined {
    if (explicitDetails !== undefined) {
      return explicitDetails;
    }
    if (Array.isArray(message)) {
      return message;
    }
    return undefined;
  }

  private mapStatusCodeToErrorCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ErrorCode.VALIDATION_ERROR;
      default:
        return statusCode >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.HTTP_ERROR;
    }
  }

  private getDefaultErrorLabel(statusCode: number): string {
    if (statusCode >= 500) {
      return 'Internal Server Error';
    }
    if (statusCode === HttpStatus.BAD_REQUEST) {
      return 'Bad Request';
    }
    if (statusCode === HttpStatus.UNAUTHORIZED) {
      return 'Unauthorized';
    }
    if (statusCode === HttpStatus.FORBIDDEN) {
      return 'Forbidden';
    }
    if (statusCode === HttpStatus.NOT_FOUND) {
      return 'Not Found';
    }
    if (statusCode === HttpStatus.CONFLICT) {
      return 'Conflict';
    }
    if (statusCode === HttpStatus.UNPROCESSABLE_ENTITY) {
      return 'Unprocessable Entity';
    }
    return 'Error';
  }
}
