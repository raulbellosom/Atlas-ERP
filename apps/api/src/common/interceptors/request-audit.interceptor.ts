import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { PUBLIC_ROUTE_KEY } from '../constants/auth.constants';

interface AuditableUser {
  sub?: string;
  organizationId?: string;
}

interface AuditableRequest extends Request {
  user?: AuditableUser;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * RequestAuditInterceptor logs mutating HTTP requests to the AuditLog
 * for authenticated users. Skips @Public routes and read-only methods.
 */
@Injectable()
export class RequestAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestAuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<AuditableRequest>();
    const response = httpCtx.getResponse<Response>();

    if (isPublic || !MUTATING_METHODS.has(request.method)) {
      return next.handle();
    }

    const userId = request.user?.sub;
    const organizationId = request.user?.organizationId;

    if (!userId || !organizationId) {
      return next.handle();
    }

    const method = request.method;
    const path = request.path;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = response.statusCode;
          this.auditService
            .auditAction({
              organizationId,
              actorId: userId,
              action: `HTTP_${method}`,
              entityType: 'Request',
              entityId: path,
              origin: 'WEB',
              result: String(statusCode),
              metadata: {
                method,
                path,
                statusCode,
                durationMs: Date.now() - startedAt,
              },
            })
            .catch((err: unknown) => {
              this.logger.warn(`Audit log failed for ${method} ${path}: ${String(err)}`);
            });
        },
        error: (err: unknown) => {
          const statusCode = (err as { status?: number }).status ?? 500;
          this.auditService
            .auditAction({
              organizationId,
              actorId: userId,
              action: `HTTP_${method}`,
              entityType: 'Request',
              entityId: path,
              origin: 'WEB',
              result: String(statusCode),
              metadata: {
                method,
                path,
                statusCode,
                durationMs: Date.now() - startedAt,
                error: String(err),
              },
            })
            .catch((auditErr: unknown) => {
              this.logger.warn(`Audit log failed for ${method} ${path}: ${String(auditErr)}`);
            });
        },
      }),
    );
  }
}
