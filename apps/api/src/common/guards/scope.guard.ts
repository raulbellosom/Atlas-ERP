import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import {
  BRANCH_SCOPE_KEY,
  ORGANIZATION_SCOPE_KEY,
} from '../constants/scope.constants';

interface ScopedUser {
  organizationId?: string;
  branchId?: string | null;
}

interface ScopedRequest extends Request {
  user?: ScopedUser;
}

/**
 * ScopeGuard enforces that the authenticated user can only access resources
 * belonging to their own organization and/or branch.
 *
 * - When @RequireOrganizationScope() is set: validates that the
 *   organizationId in URL params or body matches req.user.organizationId.
 * - When @RequireBranchScope() is set: validates that the
 *   branchId in URL params or body matches req.user.branchId.
 */
@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireOrg = this.reflector.getAllAndOverride<boolean>(
      ORGANIZATION_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requireBranch = this.reflector.getAllAndOverride<boolean>(
      BRANCH_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireOrg && !requireBranch) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ScopedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado para verificar alcance.');
    }

    if (requireOrg) {
      const requestOrgId =
        request.params?.['organizationId'] ??
        (request.body as Record<string, unknown>)?.['organizationId'] ??
        request.query?.['organizationId'];

      if (requestOrgId && requestOrgId !== user.organizationId) {
        throw new ForbiddenException(
          'No tiene acceso a recursos de otra organización.',
        );
      }
    }

    if (requireBranch) {
      const requestBranchId =
        request.params?.['branchId'] ??
        (request.body as Record<string, unknown>)?.['branchId'] ??
        request.query?.['branchId'];

      if (requestBranchId && user.branchId && requestBranchId !== user.branchId) {
        throw new ForbiddenException(
          'No tiene acceso a recursos de otra sucursal.',
        );
      }
    }

    return true;
  }
}
