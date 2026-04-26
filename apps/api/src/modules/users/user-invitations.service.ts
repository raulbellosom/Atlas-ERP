import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, UserInvitationStatus } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { ErrorCode } from '../../common/errors';
import { PasswordService } from '../../common/security/password.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { OutboundEmailService } from '../notifications/outbound-email.service';
import { InviteUserDto } from './dto/invite-user.dto';

const INVITATION_TTL_HOURS = 72;

const INVITATION_SELECT = {
  id: true,
  organizationId: true,
  email: true,
  displayName: true,
  roleId: true,
  invitedById: true,
  status: true,
  expiresAt: true,
  acceptedAt: true,
  revokedAt: true,
  lastSentAt: true,
  sendCount: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserInvitationSelect;

export type UserInvitationSummary = Prisma.UserInvitationGetPayload<{
  select: typeof INVITATION_SELECT;
}>;

type InviteValidationResult = {
  isValid: boolean;
  status: 'valid' | 'expired' | 'invalid' | 'used' | 'revoked';
  email?: string;
  displayName?: string | null;
  organizationName?: string;
  expiresAt?: Date;
};

@Injectable()
export class UserInvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly outboundEmailService: OutboundEmailService,
    private readonly configService: ConfigService,
  ) {}

  async listInvitations(organizationId: string): Promise<UserInvitationSummary[]> {
    await this.expirePendingInvitations(organizationId);

    return this.prisma.userInvitation.findMany({
      where: { organizationId },
      select: INVITATION_SELECT,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async createInvitation(dto: InviteUserDto, actorId?: string): Promise<UserInvitationSummary> {
    const organizationId = dto.organizationId;
    const email = dto.email.toLowerCase().trim();
    const displayName = dto.displayName?.trim() || null;
    const now = new Date();

    await this.ensureRoleBelongsToOrganization(dto.roleId, organizationId);

    const existingUser = await this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email,
        },
      },
      select: {
        id: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (existingUser && existingUser.deletedAt === null && existingUser.isActive) {
      throw new ConflictException({
        statusCode: 409,
        code: ErrorCode.CONFLICT,
        message: 'Ya existe un usuario activo con ese correo.',
        error: 'Conflict',
      });
    }

    await this.expirePendingInvitations(organizationId);

    const latestPending = await this.prisma.userInvitation.findFirst({
      where: {
        organizationId,
        email,
        status: UserInvitationStatus.PENDING,
      },
      orderBy: [{ createdAt: 'desc' }],
      select: { id: true, expiresAt: true },
    });

    if (latestPending && latestPending.expiresAt > now) {
      const resent = await this.resendInvitation(latestPending.id, actorId, {
        roleId: dto.roleId,
        displayName,
      });
      return resent;
    }

    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = this.buildExpirationDate();

    const invitation = await this.prisma.userInvitation.create({
      data: {
        organizationId,
        email,
        displayName,
        roleId: dto.roleId ?? null,
        invitedById: actorId ?? null,
        tokenHash,
        expiresAt,
        lastSentAt: now,
      },
      select: INVITATION_SELECT,
    });

    await this.enqueueInviteEmail(invitation, rawToken);

    await this.auditService.auditAction({
      organizationId,
      actorId,
      action: 'USER_INVITATION_CREATED',
      entityType: 'UserInvitation',
      entityId: invitation.id,
      origin: 'WEB',
      result: 'SUCCESS',
      metadata: {
        email,
      },
    });

    return invitation;
  }

  async resendInvitation(
    invitationId: string,
    actorId?: string,
    overrides?: { roleId?: string; displayName?: string | null },
  ): Promise<UserInvitationSummary> {
    const invitation = await this.prisma.userInvitation.findUnique({
      where: { id: invitationId },
      select: {
        ...INVITATION_SELECT,
        tokenHash: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Invitacion no encontrada.',
        error: 'Not Found',
      });
    }

    if (invitation.status === UserInvitationStatus.ACCEPTED) {
      throw new ConflictException({
        statusCode: 409,
        code: ErrorCode.CONFLICT,
        message: 'La invitacion ya fue aceptada.',
        error: 'Conflict',
      });
    }

    if (invitation.status === UserInvitationStatus.REVOKED) {
      throw new ConflictException({
        statusCode: 409,
        code: ErrorCode.CONFLICT,
        message: 'La invitacion fue revocada y no puede reenviarse.',
        error: 'Conflict',
      });
    }

    await this.ensureRoleBelongsToOrganization(
      overrides?.roleId ?? invitation.roleId ?? undefined,
      invitation.organizationId,
    );

    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = this.buildExpirationDate();

    const updated = await this.prisma.userInvitation.update({
      where: { id: invitationId },
      data: {
        tokenHash,
        expiresAt,
        status: UserInvitationStatus.PENDING,
        revokedAt: null,
        acceptedAt: null,
        sendCount: { increment: 1 },
        lastSentAt: new Date(),
        ...(overrides?.displayName !== undefined ? { displayName: overrides.displayName } : {}),
        ...(overrides?.roleId !== undefined ? { roleId: overrides.roleId ?? null } : {}),
      },
      select: INVITATION_SELECT,
    });

    await this.enqueueInviteEmail(updated, rawToken);

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      actorId,
      action: 'USER_INVITATION_RESENT',
      entityType: 'UserInvitation',
      entityId: updated.id,
      origin: 'WEB',
      result: 'SUCCESS',
      metadata: {
        email: updated.email,
      },
    });

    return updated;
  }

  async revokeInvitation(invitationId: string, actorId?: string): Promise<UserInvitationSummary> {
    const invitation = await this.prisma.userInvitation.findUnique({
      where: { id: invitationId },
      select: INVITATION_SELECT,
    });

    if (!invitation) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Invitacion no encontrada.',
        error: 'Not Found',
      });
    }

    if (invitation.status === UserInvitationStatus.ACCEPTED) {
      throw new ConflictException({
        statusCode: 409,
        code: ErrorCode.CONFLICT,
        message: 'No se puede revocar una invitacion aceptada.',
        error: 'Conflict',
      });
    }

    const updated = await this.prisma.userInvitation.update({
      where: { id: invitationId },
      data: {
        status: UserInvitationStatus.REVOKED,
        revokedAt: new Date(),
      },
      select: INVITATION_SELECT,
    });

    await this.auditService.auditAction({
      organizationId: updated.organizationId,
      actorId,
      action: 'USER_INVITATION_REVOKED',
      entityType: 'UserInvitation',
      entityId: updated.id,
      origin: 'WEB',
      result: 'SUCCESS',
      metadata: {
        email: updated.email,
      },
    });

    return updated;
  }

  async validateInvitation(rawToken: string): Promise<InviteValidationResult> {
    const tokenHash = this.hashToken(rawToken);

    const invitation = await this.prisma.userInvitation.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        organizationId: true,
        email: true,
        displayName: true,
        status: true,
        expiresAt: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return { isValid: false, status: 'invalid' };
    }

    if (invitation.status === UserInvitationStatus.ACCEPTED) {
      return { isValid: false, status: 'used' };
    }

    if (invitation.status === UserInvitationStatus.REVOKED) {
      return { isValid: false, status: 'revoked' };
    }

    if (invitation.status !== UserInvitationStatus.PENDING || invitation.expiresAt < new Date()) {
      if (invitation.status === UserInvitationStatus.PENDING && invitation.expiresAt < new Date()) {
        await this.prisma.userInvitation.update({
          where: { id: invitation.id },
          data: {
            status: UserInvitationStatus.EXPIRED,
          },
        });
      }
      return { isValid: false, status: 'expired' };
    }

    return {
      isValid: true,
      status: 'valid',
      email: invitation.email,
      displayName: invitation.displayName,
      organizationName: invitation.organization.name,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(rawToken: string, password: string): Promise<{ userId: string }> {
    const tokenHash = this.hashToken(rawToken);

    const invitation = await this.prisma.userInvitation.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        organizationId: true,
        email: true,
        displayName: true,
        roleId: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!invitation) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'Token de invitacion invalido.',
        error: 'Bad Request',
      });
    }

    if (invitation.status === UserInvitationStatus.ACCEPTED) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'La invitacion ya fue utilizada.',
        error: 'Bad Request',
      });
    }

    if (invitation.status === UserInvitationStatus.REVOKED) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'La invitacion fue revocada.',
        error: 'Bad Request',
      });
    }

    if (invitation.status !== UserInvitationStatus.PENDING || invitation.expiresAt < new Date()) {
      await this.prisma.userInvitation.update({
        where: { id: invitation.id },
        data: { status: UserInvitationStatus.EXPIRED },
      });
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'La invitacion expiro.',
        error: 'Bad Request',
      });
    }

    const passwordHash = await this.passwordService.hash(password);

    const result = await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: {
          organizationId_email: {
            organizationId: invitation.organizationId,
            email: invitation.email,
          },
        },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const user = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              displayName: invitation.displayName ?? invitation.email,
              passwordHash,
              isActive: true,
              isLocked: false,
              lockedAt: null,
              deletedAt: null,
            },
            select: { id: true },
          })
        : await tx.user.create({
            data: {
              organizationId: invitation.organizationId,
              email: invitation.email,
              displayName: invitation.displayName ?? invitation.email,
              passwordHash,
              isActive: true,
            },
            select: { id: true },
          });

      if (invitation.roleId) {
        await tx.userRole.upsert({
          where: {
            userId_roleId: {
              userId: user.id,
              roleId: invitation.roleId,
            },
          },
          update: {},
          create: {
            userId: user.id,
            roleId: invitation.roleId,
          },
        });
      }

      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: {
          status: UserInvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      return user;
    });

    await this.auditService.auditAction({
      organizationId: invitation.organizationId,
      actorId: result.id,
      action: 'USER_INVITATION_ACCEPTED',
      entityType: 'UserInvitation',
      entityId: invitation.id,
      origin: 'WEB',
      result: 'SUCCESS',
      metadata: {
        email: invitation.email,
      },
    });

    return { userId: result.id };
  }

  private async ensureRoleBelongsToOrganization(
    roleId: string | undefined,
    organizationId: string,
  ): Promise<void> {
    if (!roleId) return;

    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId, deletedAt: null, isActive: true },
      select: { id: true },
    });

    if (!role) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'Rol invalido para la organizacion.',
        error: 'Bad Request',
      });
    }
  }

  private buildExpirationDate(): Date {
    return new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
  }

  private generateRawToken(): string {
    return randomBytes(48).toString('hex');
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private async expirePendingInvitations(organizationId: string): Promise<void> {
    await this.prisma.userInvitation.updateMany({
      where: {
        organizationId,
        status: UserInvitationStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      data: { status: UserInvitationStatus.EXPIRED },
    });
  }

  private async enqueueInviteEmail(
    invitation: UserInvitationSummary,
    rawToken: string,
  ): Promise<void> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: invitation.organizationId },
      select: { name: true },
    });

    const inviteUrl = this.buildInviteUrl(rawToken);
    const expiresText = invitation.expiresAt.toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const recipientName = invitation.displayName ?? invitation.email;
    const organizationName = organization?.name ?? 'AtlasERP';

    const subject = `Invitacion a ${organizationName}`;
    const htmlBody = [
      '<!doctype html>',
      '<html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">',
      `<p>Hola ${this.escapeHtml(recipientName)},</p>`,
      `<p>Recibiste una invitacion para unirte a <strong>${this.escapeHtml(organizationName)}</strong> en AtlasERP.</p>`,
      `<p><a href="${this.escapeHtml(inviteUrl)}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">Aceptar invitacion</a></p>`,
      `<p>Este enlace vence el ${this.escapeHtml(expiresText)}.</p>`,
      `<p>Si no esperabas este correo, ignora este mensaje.</p>`,
      '</body></html>',
    ].join('');

    const textBody = [
      `Hola ${recipientName},`,
      '',
      `Recibiste una invitacion para unirte a ${organizationName} en AtlasERP.`,
      `Acepta aqui: ${inviteUrl}`,
      `Este enlace vence el ${expiresText}.`,
      '',
      'Si no esperabas este correo, ignora este mensaje.',
    ].join('\n');

    await this.outboundEmailService.enqueueJob({
      organizationId: invitation.organizationId,
      type: 'USER_INVITATION',
      toEmail: invitation.email,
      subject,
      htmlBody,
      textBody,
      maxAttempts: 5,
    });
  }

  private buildInviteUrl(rawToken: string): string {
    const webAppUrl = this.configService.get<string>('WEB_APP_URL') ?? 'http://localhost:5173';
    return `${webAppUrl.replace(/\/$/, '')}/auth/accept-invite?token=${encodeURIComponent(rawToken)}`;
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
