import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { ListBranchesQueryDto } from './dto/list-branches.query.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

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

  async create(dto: CreateBranchDto): Promise<BranchSummary> {
    return this.prisma.branch.create({
      data: {
        organizationId: dto.organizationId,
        name: dto.name,
        isActive: dto.isActive ?? true,
      },
      select: BRANCH_SELECT,
    });
  }

  async update(id: string, dto: UpdateBranchDto): Promise<BranchSummary> {
    const branch = await this.prisma.branch.findFirst({ where: { id, deletedAt: null } });
    if (!branch) throw new NotFoundException('Sucursal no encontrada.');
    return this.prisma.branch.update({ where: { id }, data: dto, select: BRANCH_SELECT });
  }

  async softDelete(id: string): Promise<void> {
    const branch = await this.prisma.branch.findFirst({ where: { id, deletedAt: null } });
    if (!branch) throw new NotFoundException('Sucursal no encontrada.');
    await this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
