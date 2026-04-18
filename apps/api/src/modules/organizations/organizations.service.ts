import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  buildCaseInsensitiveSearchFilter,
  buildIsActiveFilter,
  buildSoftDeleteFilter,
} from '../../common/query-filters';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListOrganizationsQueryDto } from './dto/list-organizations.query.dto';

const ORGANIZATION_SELECT = {
  id: true,
  name: true,
  slug: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.OrganizationSelect;

type OrganizationSummary = Prisma.OrganizationGetPayload<{
  select: typeof ORGANIZATION_SELECT;
}>;

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ListOrganizationsQueryDto,
  ): Promise<OrganizationSummary[]> {
    const where: Prisma.OrganizationWhereInput = {
      ...buildSoftDeleteFilter(false),
      ...buildIsActiveFilter(query.includeInactive),
      ...buildCaseInsensitiveSearchFilter(['name', 'slug'], query.search),
    };

    return this.prisma.organization.findMany({
      where,
      select: ORGANIZATION_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async findOneById(id: string): Promise<OrganizationSummary | null> {
    return this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
      select: ORGANIZATION_SELECT,
    });
  }

  async findOneBySlug(slug: string): Promise<OrganizationSummary | null> {
    return this.prisma.organization.findFirst({
      where: { slug, deletedAt: null },
      select: ORGANIZATION_SELECT,
    });
  }
}
