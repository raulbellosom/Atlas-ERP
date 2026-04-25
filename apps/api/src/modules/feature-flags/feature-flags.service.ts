import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildCaseInsensitiveSearchFilter, buildIsActiveFilter } from '../../common/query-filters';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListFeatureFlagsQueryDto } from './dto/list-feature-flags.query.dto';

const FEATURE_FLAG_SELECT = {
  id: true,
  key: true,
  description: true,
  defaultValue: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FeatureFlagSelect;

type FeatureFlagSummary = Prisma.FeatureFlagGetPayload<{
  select: typeof FEATURE_FLAG_SELECT;
}>;

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListFeatureFlagsQueryDto): Promise<FeatureFlagSummary[]> {
    return this.prisma.featureFlag.findMany({
      where: {
        ...buildIsActiveFilter(query.includeInactive),
        ...buildCaseInsensitiveSearchFilter(['key', 'description'], query.search),
      },
      select: FEATURE_FLAG_SELECT,
      orderBy: [{ key: 'asc' }],
    });
  }

  async findOneByKey(key: string): Promise<FeatureFlagSummary | null> {
    return this.prisma.featureFlag.findUnique({
      where: { key },
      select: FEATURE_FLAG_SELECT,
    });
  }

  async toggle(key: string): Promise<FeatureFlagSummary> {
    const flag = await this.prisma.featureFlag.findUniqueOrThrow({ where: { key } });
    return this.prisma.featureFlag.update({
      where: { key },
      data: { isActive: !flag.isActive },
      select: FEATURE_FLAG_SELECT,
    });
  }
}
