import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_ALL_KEY,
  PERMISSIONS_ANY_KEY,
} from '../constants/authorization.constants';
import { AuthorizationService } from '../security/authorization.service';

interface AuthenticatedUser {
  sub?: string;
  permissions?: string[];
  role?: string | null;
  roleIds?: string[];
}

interface PermissionRequest {
  user?: AuthenticatedUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.DISABLE_AUTH_GUARDS === 'true') {
      return true;
    }

    const requiredAll =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_ALL_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const requiredAny =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_ANY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredAll.length === 0 && requiredAny.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<PermissionRequest>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Usuario no autenticado para verificar permisos.');
    }

    const grantedPermissions = await this.resolvePermissions(userId, request);

    if (
      requiredAll.length > 0 &&
      requiredAll.some((permission) => !grantedPermissions.includes(permission))
    ) {
      throw new ForbiddenException('El usuario no cumple todos los permisos requeridos.');
    }

    if (
      requiredAny.length > 0 &&
      !requiredAny.some((permission) => grantedPermissions.includes(permission))
    ) {
      throw new ForbiddenException('El usuario no cumple ningun permiso permitido.');
    }

    return true;
  }

  private async resolvePermissions(
    userId: string,
    request: PermissionRequest,
  ): Promise<string[]> {
    if (request.user?.permissions && request.user.permissions.length > 0) {
      return request.user.permissions;
    }

    const accessContext = await this.authorizationService.resolveAccessContext(userId);

    if (request.user) {
      request.user.permissions = accessContext.permissions;
      request.user.role = accessContext.role;
      request.user.roleIds = accessContext.roleIds;
    }

    return accessContext.permissions;
  }
}
