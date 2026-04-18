import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListBranchesQueryDto } from './dto/list-branches.query.dto';

const BRANCH_SELECT = {
  id: true,
  organizationId: true,
  name: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BranchSelect;

type BranchSummary = Prisma.BranchGetPayload<{ select: typeof BRANCH_SELECT }>;

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListBranchesQueryDto): Promise<BranchSummary[]> {
    const where: Prisma.BranchWhereInput = {
      deletedAt: null,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.includeInactive ? {} : { isActive: true }),
    };

    return this.prisma.branch.findMany({
      where,
      select: BRANCH_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async findOneById(id: string): Promise<BranchSummary | null> {
    return this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
      select: BRANCH_SELECT,
    });
  }

  async countActiveByOrganization(organizationId: string): Promise<number> {
    return this.prisma.branch.count({
      where: {
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });
  }
}
