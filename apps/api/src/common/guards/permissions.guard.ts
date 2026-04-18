import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  PERMISSIONS_ALL_KEY,
  PERMISSIONS_ANY_KEY,
} from '../constants/authorization.constants';

interface AuthenticatedUser {
  sub?: string;
  permissions?: string[];
}

interface PermissionRequest {
  user?: AuthenticatedUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      requiredAll.some((p) => !grantedPermissions.includes(p))
    ) {
      throw new ForbiddenException('El usuario no cumple todos los permisos requeridos.');
    }

    if (
      requiredAny.length > 0 &&
      !requiredAny.some((p) => grantedPermissions.includes(p))
    ) {
      throw new ForbiddenException('El usuario no cumple ningún permiso permitido.');
    }

    return true;
  }

  private async resolvePermissions(
    userId: string,
    request: PermissionRequest,
  ): Promise<string[]> {
    // Use cached permissions if already loaded in this request
    if (request.user?.permissions && request.user.permissions.length > 0) {
      return request.user.permissions;
    }

    // Load roles → ancestor roles → permissions from DB
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });

    if (userRoles.length === 0) return [];

    const roleIds = new Set<string>(userRoles.map((ur) => ur.roleId));
    const toResolve = [...roleIds];

    while (toResolve.length > 0) {
      const roles = await this.prisma.role.findMany({
        where: { id: { in: toResolve }, deletedAt: null },
        select: { id: true, parentRoleId: true },
      });
      toResolve.length = 0;
      for (const role of roles) {
        if (role.parentRoleId && !roleIds.has(role.parentRoleId)) {
          roleIds.add(role.parentRoleId);
          toResolve.push(role.parentRoleId);
        }
      }
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: { in: Array.from(roleIds) } },
      select: { permission: { select: { key: true } } },
    });

    const permissions = [...new Set(rolePermissions.map((rp) => rp.permission.key))];

    // Cache on request object for subsequent guards in the same request
    if (request.user) {
      request.user.permissions = permissions;
    }

    return permissions;
  }
}
