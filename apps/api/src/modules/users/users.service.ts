import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../../common/errors';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SessionsService } from '../sessions/sessions.service';
import { ListUsersQueryDto } from './dto/list-users.query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const USER_SELECT = {
  id: true,
  organizationId: true,
  branchId: true,
  email: true,
  firstName: true,
  lastName: true,
  displayName: true,
  phone: true,
  address: true,
  avatarAttachmentId: true,
  isActive: true,
  isLocked: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    select: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

const USER_AUTH_SELECT = {
  id: true,
  organizationId: true,
  branchId: true,
  email: true,
  displayName: true,
  passwordHash: true,
  isActive: true,
  isLocked: true,
  lockedAt: true,
  lastLoginAt: true,
} satisfies Prisma.UserSelect;

type UserSummary = Prisma.UserGetPayload<{ select: typeof USER_SELECT }>;
export type UserForAuth = Prisma.UserGetPayload<{ select: typeof USER_AUTH_SELECT }>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionsService: SessionsService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: ListUsersQueryDto): Promise<UserSummary[]> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.includeInactive ? {} : { isActive: true }),
    };

    return this.prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async findOneById(id: string): Promise<UserSummary | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_SELECT,
    });
  }

  async updateOwnProfile(userId: string, dto: UpdateProfileDto): Promise<UserSummary> {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND });

    const firstName = dto.firstName !== undefined ? dto.firstName : undefined;
    const lastName = dto.lastName !== undefined ? dto.lastName : undefined;
    const derivedDisplayName =
      firstName !== undefined || lastName !== undefined
        ? [firstName ?? user.firstName ?? '', lastName ?? user.lastName ?? ''].join(' ').trim() ||
          user.displayName
        : undefined;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(derivedDisplayName !== undefined && { displayName: derivedDisplayName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...('avatarAttachmentId' in dto && { avatarAttachmentId: dto.avatarAttachmentId ?? null }),
      } as Prisma.UserUpdateInput,
      select: USER_SELECT,
    });
  }

  async countActiveByOrganization(organizationId: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async findForAuth(
    organizationId: string | undefined,
    email: string,
  ): Promise<UserForAuth | null> {
    if (!organizationId) {
      const candidates = await this.prisma.user.findMany({
        where: {
          email: email.toLowerCase().trim(),
          deletedAt: null,
        },
        select: USER_AUTH_SELECT,
        take: 2,
        orderBy: [{ createdAt: 'asc' }],
      });

      if (candidates.length !== 1) {
        return null;
      }

      return candidates[0] ?? null;
    }

    return this.prisma.user.findFirst({
      where: {
        organizationId,
        email: email.toLowerCase().trim(),
        deletedAt: null,
      },
      select: USER_AUTH_SELECT,
    });
  }

  async countActiveAuthCandidatesByEmail(email: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        email: email.toLowerCase().trim(),
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async touchLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async lockUser(userId: string, organizationId: string, actorId?: string): Promise<UserSummary> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, organizationId: true, isLocked: true },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Usuario no encontrado.',
        error: 'Not Found',
      });
    }

    await this.sessionsService.revokeAllUserSessions(userId, organizationId);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: true, lockedAt: new Date() },
      select: USER_SELECT,
    });

    await this.auditService.auditAction({
      organizationId,
      actorId,
      action: 'USER_LOCKED',
      entityType: 'User',
      entityId: userId,
      origin: 'WEB',
      result: 'SUCCESS',
      before: { isLocked: user.isLocked },
      after: { isLocked: true },
    });

    return updated;
  }

  async unlockUser(userId: string, actorId?: string): Promise<UserSummary> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, organizationId: true, isLocked: true },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Usuario no encontrado.',
        error: 'Not Found',
      });
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: false, lockedAt: null },
      select: USER_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: user.organizationId,
      actorId,
      action: 'USER_UNLOCKED',
      entityType: 'User',
      entityId: userId,
      origin: 'WEB',
      result: 'SUCCESS',
      before: { isLocked: user.isLocked },
      after: { isLocked: false },
    });

    return updated;
  }

  async activateUser(userId: string, actorId?: string): Promise<UserSummary> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, organizationId: true, isActive: true },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Usuario no encontrado.',
        error: 'Not Found',
      });
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: USER_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: user.organizationId,
      actorId,
      action: 'USER_ACTIVATED',
      entityType: 'User',
      entityId: userId,
      origin: 'WEB',
      result: 'SUCCESS',
      before: { isActive: user.isActive },
      after: { isActive: true },
    });

    return updated;
  }

  async deactivateUser(
    userId: string,
    organizationId: string,
    actorId?: string,
  ): Promise<UserSummary> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, organizationId: true, isActive: true },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Usuario no encontrado.',
        error: 'Not Found',
      });
    }

    await this.sessionsService.revokeAllUserSessions(userId, organizationId);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: USER_SELECT,
    });

    await this.auditService.auditAction({
      organizationId,
      actorId,
      action: 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: userId,
      origin: 'WEB',
      result: 'SUCCESS',
      before: { isActive: user.isActive },
      after: { isActive: false },
    });

    return updated;
  }

  async updateUserRoles(
    userId: string,
    organizationId: string,
    roleIds: string[],
    actorId?: string,
  ): Promise<UserSummary> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Usuario no encontrado en la organización.',
        error: 'Not Found',
      });
    }

    // Usar transacción para actualizar los roles atómicamente
    await this.prisma.$transaction(async (tx) => {
      // 1. Eliminar roles actuales
      await tx.userRole.deleteMany({
        where: { userId },
      });

      // 2. Insertar nuevos roles
      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId,
            roleId,
          })),
          skipDuplicates: true,
        });
      }
    });

    // Revocar las sesiones del usuario para forzar re-login con los nuevos roles
    await this.sessionsService.revokeAllUserSessions(userId, organizationId);

    // Auditoría
    await this.auditService.auditAction({
      organizationId,
      actorId,
      action: 'USER_ROLES_UPDATED',
      entityType: 'User',
      entityId: userId,
      origin: 'WEB',
      result: 'SUCCESS',
      metadata: { newRoleIds: roleIds },
    });

    // Retornar el usuario actualizado
    return this.findOneById(userId) as Promise<UserSummary>;
  }
}
