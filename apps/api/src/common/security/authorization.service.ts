import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export interface UserAccessContext {
  role: string | null;
  roles: string[];
  roleIds: string[];
  permissions: string[];
}

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveAccessContext(userId: string): Promise<UserAccessContext> {
    const roleRecords = await this.resolveRolesForUser(userId);
    const roleIds = roleRecords.map((role) => role.id);
    const permissions = await this.resolvePermissionsForRoleIds(roleIds);

    return {
      role: roleRecords[0]?.name ?? null,
      roles: roleRecords.map((role) => role.name),
      roleIds,
      permissions,
    };
  }

  async resolvePermissionsForUser(userId: string): Promise<string[]> {
    const roleIds = await this.resolveRoleIdsForUser(userId);
    return this.resolvePermissionsForRoleIds(roleIds);
  }

  async resolveRoleIdsForUser(userId: string): Promise<string[]> {
    const roleRecords = await this.resolveRolesForUser(userId);
    return roleRecords.map((role) => role.id);
  }

  private async resolveRolesForUser(
    userId: string,
  ): Promise<Array<{ id: string; name: string; level: number }>> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });

    if (userRoles.length === 0) {
      return [];
    }

    const roleIds = new Set<string>(userRoles.map((ur) => ur.roleId));
    const toResolve = [...roleIds];

    while (toResolve.length > 0) {
      const roles = await this.prisma.role.findMany({
        where: { id: { in: toResolve }, deletedAt: null, isActive: true },
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

    const expandedRoles = await this.prisma.role.findMany({
      where: {
        id: { in: Array.from(roleIds) },
        deletedAt: null,
        isActive: true,
      },
      select: { id: true, name: true, level: true },
      orderBy: [{ level: 'desc' }, { name: 'asc' }],
    });

    return expandedRoles;
  }

  private async resolvePermissionsForRoleIds(roleIds: string[]): Promise<string[]> {
    if (roleIds.length === 0) {
      return [];
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId: { in: roleIds },
        permission: { isActive: true },
      },
      select: { permission: { select: { key: true } } },
    });

    return [...new Set(rolePermissions.map((rp) => rp.permission.key))].sort();
  }
}
