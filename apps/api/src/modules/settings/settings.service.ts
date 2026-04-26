import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../../common/errors';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListSettingsQueryDto } from './dto/list-settings.query.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UpsertEmailOutboundDto } from './dto/upsert-email-outbound.dto';

export const EMAIL_OUTBOUND_SETTING_KEY = 'platform.email.outbound';
export const EMAIL_OUTBOUND_HEALTH_SETTING_KEY = 'platform.email.outbound.health';

const SETTING_SELECT = {
  id: true,
  organizationId: true,
  key: true,
  value: true,
  description: true,
  isActive: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SettingSelect;

type SettingSummary = Prisma.SettingGetPayload<{ select: typeof SETTING_SELECT }>;

export type EmailOutboundConfig = {
  provider: 'smtp';
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  timeoutMs: number;
  isActive: boolean;
};

type EmailOutboundHealth = {
  lastSuccessAt?: string;
  lastErrorAt?: string;
  lastErrorMessage?: string;
};

export type EmailOutboundView = Omit<EmailOutboundConfig, 'password'> & {
  hasPassword: boolean;
  health: EmailOutboundHealth | null;
};

const DEFAULT_EMAIL_OUTBOUND_CONFIG: EmailOutboundConfig = {
  provider: 'smtp',
  host: '',
  port: 587,
  secure: false,
  user: '',
  password: '',
  fromName: 'AtlasERP',
  fromEmail: '',
  timeoutMs: 10000,
  isActive: false,
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListSettingsQueryDto): Promise<SettingSummary[]> {
    const includeGlobal = query.includeGlobal ?? true;

    const where: Prisma.SettingWhereInput = {
      ...(query.includeInactive ? {} : { isActive: true }),
      ...(query.search
        ? {
            OR: [
              { key: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    if (query.organizationId) {
      if (includeGlobal) {
        where.OR = [
          ...(where.OR ?? []),
          { organizationId: query.organizationId },
          { organizationId: null },
        ];
      } else {
        where.organizationId = query.organizationId;
      }
    }

    return this.prisma.setting.findMany({
      where,
      select: SETTING_SELECT,
      orderBy: [{ key: 'asc' }, { organizationId: 'asc' }],
    });
  }

  async findOneById(id: string): Promise<SettingSummary | null> {
    return this.prisma.setting.findUnique({
      where: { id },
      select: SETTING_SELECT,
    });
  }

  async update(id: string, dto: UpdateSettingDto): Promise<SettingSummary> {
    return this.prisma.setting.update({
      where: { id },
      data: { value: dto.value },
      select: SETTING_SELECT,
    });
  }

  async findOneByKey(key: string, organizationId?: string): Promise<SettingSummary | null> {
    if (organizationId) {
      return this.prisma.setting.findFirst({
        where: {
          key,
          isActive: true,
          OR: [{ organizationId }, { organizationId: null }],
        },
        select: SETTING_SELECT,
        orderBy: { organizationId: 'desc' },
      });
    }

    return this.prisma.setting.findFirst({
      where: { key, isActive: true },
      select: SETTING_SELECT,
      orderBy: { organizationId: 'desc' },
    });
  }

  async getEmailOutboundConfig(): Promise<EmailOutboundView> {
    const rawConfig = await this.getJsonSetting<Partial<EmailOutboundConfig>>(
      EMAIL_OUTBOUND_SETTING_KEY,
    );
    const rawHealth = await this.getJsonSetting<EmailOutboundHealth>(
      EMAIL_OUTBOUND_HEALTH_SETTING_KEY,
    );

    const merged: EmailOutboundConfig = {
      ...DEFAULT_EMAIL_OUTBOUND_CONFIG,
      ...(rawConfig ?? {}),
      provider: 'smtp',
    };

    return {
      provider: merged.provider,
      host: merged.host,
      port: merged.port,
      secure: merged.secure,
      user: merged.user,
      fromName: merged.fromName,
      fromEmail: merged.fromEmail,
      timeoutMs: merged.timeoutMs,
      isActive: merged.isActive,
      hasPassword: Boolean(merged.password),
      health: rawHealth ?? null,
    };
  }

  async upsertEmailOutboundConfig(
    dto: UpsertEmailOutboundDto,
    updatedById?: string,
  ): Promise<EmailOutboundView> {
    const current = await this.getRawEmailOutboundConfig();

    const next: EmailOutboundConfig = {
      provider: 'smtp',
      host: dto.host ?? current.host,
      port: dto.port ?? current.port,
      secure: dto.secure ?? current.secure,
      user: dto.user ?? current.user,
      password: dto.password !== undefined ? dto.password : current.password,
      fromName: dto.fromName ?? current.fromName,
      fromEmail: dto.fromEmail ?? current.fromEmail,
      timeoutMs: dto.timeoutMs ?? current.timeoutMs,
      isActive: dto.isActive ?? current.isActive,
    };

    if (next.isActive) {
      this.assertValidEmailOutboundConfig(next);
    }

    await this.upsertGlobalSetting(
      EMAIL_OUTBOUND_SETTING_KEY,
      JSON.stringify(next),
      'Configuracion global de correo saliente (SMTP).',
      updatedById,
    );

    return this.getEmailOutboundConfig();
  }

  async getRawEmailOutboundConfig(): Promise<EmailOutboundConfig> {
    const rawConfig = await this.getJsonSetting<Partial<EmailOutboundConfig>>(
      EMAIL_OUTBOUND_SETTING_KEY,
    );
    return {
      ...DEFAULT_EMAIL_OUTBOUND_CONFIG,
      ...(rawConfig ?? {}),
      provider: 'smtp',
    };
  }

  assertValidEmailOutboundConfig(config: EmailOutboundConfig): void {
    if (!config.host.trim()) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'SMTP host es requerido.',
        error: 'Bad Request',
      });
    }

    if (!config.user.trim()) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'SMTP user es requerido.',
        error: 'Bad Request',
      });
    }

    if (!config.password.trim()) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'SMTP password es requerido.',
        error: 'Bad Request',
      });
    }

    if (!config.fromEmail.trim()) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'fromEmail es requerido.',
        error: 'Bad Request',
      });
    }
  }

  private async getJsonSetting<T>(key: string): Promise<T | null> {
    const setting = await this.prisma.setting.findFirst({
      where: {
        key,
        organizationId: null,
      },
      select: {
        value: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!setting?.value) return null;

    try {
      return JSON.parse(setting.value) as T;
    } catch {
      return null;
    }
  }

  private async upsertGlobalSetting(
    key: string,
    value: string,
    description: string,
    updatedById?: string,
  ): Promise<void> {
    const existing = await this.prisma.setting.findFirst({
      where: {
        organizationId: null,
        key,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      await this.prisma.setting.update({
        where: { id: existing.id },
        data: {
          value,
          description,
          isActive: true,
          updatedById: updatedById ?? null,
        },
      });
      return;
    }

    await this.prisma.setting.create({
      data: {
        organizationId: null,
        key,
        value,
        description,
        isActive: true,
        updatedById: updatedById ?? null,
      },
    });
  }
}
