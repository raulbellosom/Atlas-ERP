import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListPermissionsQueryDto } from './dto/list-permissions.query.dto';

const PERMISSION_SELECT = {
  id: true,
  key: true,
  module: true,
  action: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PermissionSelect;

type PermissionSummary = Prisma.PermissionGetPayload<{
  select: typeof PERMISSION_SELECT;
}>;

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListPermissionsQueryDto): Promise<PermissionSummary[]> {
    const where: Prisma.PermissionWhereInput = {
      ...(query.module ? { module: query.module } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.includeInactive ? {} : { isActive: true }),
    };

    return this.prisma.permission.findMany({
      where,
      select: PERMISSION_SELECT,
      orderBy: [{ module: 'asc' }, { action: 'asc' }, { key: 'asc' }],
    });
  }

  async findOneByKey(key: string): Promise<PermissionSummary | null> {
    return this.prisma.permission.findUnique({
      where: { key },
      select: PERMISSION_SELECT,
    });
  }
}
