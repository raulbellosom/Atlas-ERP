import {
  createParamDecorator,
  SetMetadata,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  BRANCH_SCOPE_KEY,
  ORGANIZATION_SCOPE_KEY,
} from '../constants/scope.constants';
import { getSingleHeaderValue } from '../utils/http-request.util';

interface ScopedRequest extends Request {
  user?: {
    organizationId?: string;
    branchId?: string;
  };
}

export const RequireOrganizationScope = (): MethodDecorator & ClassDecorator =>
  SetMetadata(ORGANIZATION_SCOPE_KEY, true);

export const RequireBranchScope = (): MethodDecorator & ClassDecorator =>
  SetMetadata(BRANCH_SCOPE_KEY, true);

export const CurrentOrganizationId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined => {
    const request = context.switchToHttp().getRequest<ScopedRequest>();
    return (
      request.user?.organizationId ??
      getSingleHeaderValue(request.headers, 'x-organization-id')
    );
  },
);

export const CurrentBranchId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined => {
    const request = context.switchToHttp().getRequest<ScopedRequest>();
    return request.user?.branchId ?? getSingleHeaderValue(request.headers, 'x-branch-id');
  },
);
