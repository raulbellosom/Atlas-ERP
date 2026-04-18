import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, RefreshTokenStatus, SessionStatus } from '@prisma/client';
import { ErrorCode } from '../../common/errors';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

const SESSION_SELECT = {
  id: true,
  organizationId: true,
  userId: true,
  deviceRegistryId: true,
  status: true,
  ipAddress: true,
  userAgent: true,
  lastActivityAt: true,
  expiresAt: true,
  revokedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SessionSelect;

const REFRESH_TOKEN_SELECT = {
  id: true,
  sessionId: true,
  organizationId: true,
  userId: true,
  tokenHash: true,
  status: true,
  parentTokenId: true,
  issuedAt: true,
  expiresAt: true,
  revokedAt: true,
  rotatedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RefreshTokenSelect;

export type SessionRecord = Prisma.SessionGetPayload<{
  select: typeof SESSION_SELECT;
}>;

export type RefreshTokenRecord = Prisma.RefreshTokenGetPayload<{
  select: typeof REFRESH_TOKEN_SELECT;
}>;

export interface CreateSessionInput {
  organizationId: string;
  userId: string;
  deviceRegistryId?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

export interface CreateRefreshTokenInput {
  sessionId: string;
  organizationId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  parentTokenId?: string;
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(input: CreateSessionInput): Promise<SessionRecord> {
    return this.prisma.session.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        deviceRegistryId: input.deviceRegistryId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        status: SessionStatus.ACTIVE,
        expiresAt: input.expiresAt,
        lastActivityAt: new Date(),
      },
      select: SESSION_SELECT,
    });
  }

  async findActiveSession(sessionId: string): Promise<SessionRecord | null> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: SESSION_SELECT,
    });

    if (!session || session.status !== SessionStatus.ACTIVE) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      await this.expireSession(sessionId);
      return null;
    }

    return session;
  }

  async findSessionsByUser(
    userId: string,
    organizationId: string,
  ): Promise<SessionRecord[]> {
    return this.prisma.session.findMany({
      where: { userId, organizationId, status: SessionStatus.ACTIVE },
      select: SESSION_SELECT,
      orderBy: { lastActivityAt: 'desc' },
    });
  }

  async touchSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });

    if (!session) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Sesión no encontrada.',
        error: 'Not Found',
      });
    }

    await this.prisma.$transaction([
      this.prisma.session.update({
        where: { id: sessionId },
        data: { status: SessionStatus.REVOKED, revokedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { sessionId, status: RefreshTokenStatus.ACTIVE },
        data: { status: RefreshTokenStatus.REVOKED, revokedAt: new Date() },
      }),
    ]);
  }

  async revokeAllUserSessions(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const activeSessions = await this.prisma.session.findMany({
      where: { userId, organizationId, status: SessionStatus.ACTIVE },
      select: { id: true },
    });

    const sessionIds = activeSessions.map((s) => s.id);

    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: { id: { in: sessionIds } },
        data: { status: SessionStatus.REVOKED, revokedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { sessionId: { in: sessionIds }, status: RefreshTokenStatus.ACTIVE },
        data: { status: RefreshTokenStatus.REVOKED, revokedAt: new Date() },
      }),
    ]);
  }

  async createRefreshToken(
    input: CreateRefreshTokenInput,
  ): Promise<RefreshTokenRecord> {
    return this.prisma.refreshToken.create({
      data: {
        sessionId: input.sessionId,
        organizationId: input.organizationId,
        userId: input.userId,
        tokenHash: input.tokenHash,
        parentTokenId: input.parentTokenId ?? null,
        status: RefreshTokenStatus.ACTIVE,
        expiresAt: input.expiresAt,
      },
      select: REFRESH_TOKEN_SELECT,
    });
  }

  async findValidRefreshToken(
    tokenHash: string,
  ): Promise<RefreshTokenRecord | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: REFRESH_TOKEN_SELECT,
    });

    if (!token || token.status !== RefreshTokenStatus.ACTIVE) {
      return null;
    }

    if (token.expiresAt < new Date()) {
      await this.prisma.refreshToken.update({
        where: { id: token.id },
        data: { status: RefreshTokenStatus.EXPIRED },
      });
      return null;
    }

    return token;
  }

  async rotateRefreshToken(
    oldTokenHash: string,
    newInput: Omit<CreateRefreshTokenInput, 'parentTokenId'>,
  ): Promise<RefreshTokenRecord> {
    const oldToken = await this.findValidRefreshToken(oldTokenHash);

    if (!oldToken) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: 'Refresh token inválido o expirado.',
        error: 'Unauthorized',
      });
    }

    const [, newToken] = await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: oldToken.id },
        data: { status: RefreshTokenStatus.ROTATED, rotatedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          sessionId: newInput.sessionId,
          organizationId: newInput.organizationId,
          userId: newInput.userId,
          tokenHash: newInput.tokenHash,
          parentTokenId: oldToken.id,
          status: RefreshTokenStatus.ACTIVE,
          expiresAt: newInput.expiresAt,
        },
        select: REFRESH_TOKEN_SELECT,
      }),
    ]);

    return newToken;
  }

  private async expireSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.EXPIRED },
    });
  }
}
