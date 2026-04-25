import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListSettingsQueryDto } from './dto/list-settings.query.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

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
}
