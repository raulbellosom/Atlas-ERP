import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../constants/authorization.constants';
import { getCsvHeaderValues } from '../utils/http-request.util';

interface AuthorizableRequest extends Request {
  user?: {
    roles?: string[];
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizableRequest>();
    const grantedRoles = this.extractRoles(request);

    if (grantedRoles.length === 0) {
      throw new ForbiddenException('No hay roles disponibles para autorizar');
    }

    const hasRole = requiredRoles.some((role) => grantedRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('El usuario no tiene roles autorizados');
    }

    return true;
  }

  private extractRoles(request: AuthorizableRequest): string[] {
    const userRoles = request.user?.roles ?? [];
    if (userRoles.length > 0) {
      return userRoles;
    }

    return getCsvHeaderValues(request.headers, 'x-atlas-roles');
  }
}
