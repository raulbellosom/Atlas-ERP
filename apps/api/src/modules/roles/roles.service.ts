import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListRolesQueryDto } from './dto/list-roles.query.dto';

const ROLE_SELECT = {
  id: true,
  organizationId: true,
  name: true,
  description: true,
  isActive: true,
  level: true,
  parentRoleId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      rolePermissions: true,
      userRoles: true,
    },
  },
} satisfies Prisma.RoleSelect;

type RoleWithCounts = Prisma.RoleGetPayload<{ select: typeof ROLE_SELECT }>;

export interface RoleSummary {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  level: number;
  parentRoleId: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissionCount: number;
  userCount: number;
}

export interface PermissionRecord {
  key: string;
  module: string;
  action: string;
  description: string | null;
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListRolesQueryDto): Promise<RoleSummary[]> {
    const where: Prisma.RoleWhereInput = {
      deletedAt: null,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.includeInactive ? {} : { isActive: true }),
    };

    const roles = await this.prisma.role.findMany({
      where,
      select: ROLE_SELECT,
      orderBy: [{ level: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
    });

    return roles.map((role) => this.toSummary(role));
  }

  async findOneById(id: string): Promise<RoleSummary | null> {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
      select: ROLE_SELECT,
    });

    if (!role) {
      return null;
    }

    return this.toSummary(role);
  }

  async findPermissionsByRoleId(roleId: string): Promise<PermissionRecord[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      select: {
        permission: {
          select: {
            key: true,
            module: true,
            action: true,
            description: true,
          },
        },
      },
      orderBy: [
        { permission: { module: 'asc' } },
        { permission: { action: 'asc' } },
      ],
    });

    return rolePermissions.map((rp) => rp.permission);
  }

  /**
   * Returns the effective permission keys for a set of role IDs,
   * resolving the full ancestor chain for each role (hierarchical inheritance).
   */
  async findEffectivePermissionKeys(roleIds: string[]): Promise<string[]> {
    if (roleIds.length === 0) return [];

    const allRoleIds = new Set<string>(roleIds);
    const toResolve = [...roleIds];

    // Walk up the parent chain until no new parents are found
    while (toResolve.length > 0) {
      const roles = await this.prisma.role.findMany({
        where: { id: { in: toResolve }, deletedAt: null },
        select: { id: true, parentRoleId: true },
      });

      toResolve.length = 0;
      for (const role of roles) {
        if (role.parentRoleId && !allRoleIds.has(role.parentRoleId)) {
          allRoleIds.add(role.parentRoleId);
          toResolve.push(role.parentRoleId);
        }
      }
    }

    const permissions = await this.prisma.rolePermission.findMany({
      where: { roleId: { in: Array.from(allRoleIds) } },
      select: { permission: { select: { key: true } } },
    });

    return [...new Set(permissions.map((rp) => rp.permission.key))];
  }

  private toSummary(role: RoleWithCounts): RoleSummary {
    return {
      id: role.id,
      organizationId: role.organizationId,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      level: role.level,
      parentRoleId: role.parentRoleId,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissionCount: role._count.rolePermissions,
      userCount: role._count.userRoles,
    };
  }
}
