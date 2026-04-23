import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { InstallModuleDto } from './dto/install.dto';
import { UninstallModuleDto } from './dto/uninstall.dto';

const CORE_MODULES = new Set(['core-platform']);

const CATALOG_SELECT = {
  moduleKey: true,
  name: true,
  description: true,
  isCore: true,
  lifecycleState: true,
  createdAt: true,
  versions: {
    select: {
      version: true,
      compatibilityRange: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' as const },
  },
} satisfies Prisma.ModuleDefinitionSelect;

const INSTALLATION_SELECT = {
  id: true,
  moduleKey: true,
  version: true,
  status: true,
  installedAt: true,
  updatedAt: true,
} satisfies Prisma.TenantModuleInstallationSelect;

const JOB_SELECT = {
  id: true,
  organizationId: true,
  moduleKey: true,
  operation: true,
  status: true,
  requestId: true,
  logJson: true,
  startedAt: true,
  finishedAt: true,
  createdAt: true,
} satisfies Prisma.ModuleInstallJobSelect;

@Injectable()
export class ModuleStoreService {
  private readonly logger = new Logger(ModuleStoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getCatalog(query: CatalogQueryDto) {
    const where: Prisma.ModuleDefinitionWhereInput = {
      ...(query.includeDeprecated ? {} : { lifecycleState: { not: 'DEPRECATED' } }),
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
    };
    return this.prisma.moduleDefinition.findMany({
      where,
      select: CATALOG_SELECT,
      orderBy: [{ isCore: 'desc' }, { name: 'asc' }],
    });
  }

  async getInstalled(organizationId: string) {
    return this.prisma.tenantModuleInstallation.findMany({
      where: { organizationId },
      select: INSTALLATION_SELECT,
      orderBy: { installedAt: 'desc' },
    });
  }

  async install(dto: InstallModuleDto, actorUserId: string) {
    const { organizationId, moduleKey, version } = dto;

    const existing = await this.prisma.tenantModuleInstallation.findFirst({
      where: { organizationId, moduleKey, status: { not: 'DISABLED' } },
    });
    if (existing) {
      throw new ConflictException(
        `El módulo "${moduleKey}" ya está instalado en esta organización.`,
      );
    }

    await this._checkDependencies(organizationId, moduleKey);

    const moduleVersion = await this.prisma.moduleVersion.findFirst({
      where: { moduleKey, version },
    });
    if (!moduleVersion) {
      throw new NotFoundException(`La versión "${version}" del módulo "${moduleKey}" no existe.`);
    }

    const requestId = randomUUID();
    const now = new Date();

    const job = await this.prisma.moduleInstallJob.create({
      data: {
        organizationId,
        moduleKey,
        operation: 'INSTALL',
        status: 'RUNNING',
        requestId,
        startedAt: now,
      },
      select: JOB_SELECT,
    });

    try {
      await this.prisma.tenantModuleInstallation.create({
        data: { organizationId, moduleKey, version, status: 'INSTALLED' },
      });

      await this.prisma.moduleInstallJob.create({
        data: {
          organizationId,
          moduleKey,
          operation: 'INSTALL',
          status: 'COMPLETED',
          requestId: randomUUID(),
          startedAt: now,
          finishedAt: new Date(),
        },
      });

      await this.prisma.moduleLifecycleAuditEvent.create({
        data: {
          organizationId,
          moduleKey,
          action: 'INSTALLED',
          actorUserId,
          afterState: { version, status: 'INSTALLED' },
        },
      });

      this.logger.log(
        JSON.stringify({ event: 'MODULE_INSTALLED', organizationId, moduleKey, version }),
      );

      return { ...job, status: 'COMPLETED' as const };
    } catch (err) {
      await this.prisma.moduleInstallJob.create({
        data: {
          organizationId,
          moduleKey,
          operation: 'INSTALL',
          status: 'FAILED',
          requestId: randomUUID(),
          startedAt: now,
          finishedAt: new Date(),
          logJson: { error: String(err) },
        },
      });
      throw err;
    }
  }

  async uninstall(dto: UninstallModuleDto, actorUserId: string) {
    const { organizationId, moduleKey } = dto;

    if (CORE_MODULES.has(moduleKey)) {
      throw new ConflictException(
        `El módulo "${moduleKey}" es un módulo núcleo y no puede desinstalarse.`,
      );
    }

    const installation = await this.prisma.tenantModuleInstallation.findFirst({
      where: { organizationId, moduleKey, status: 'INSTALLED' },
    });
    if (!installation) {
      throw new NotFoundException(
        `El módulo "${moduleKey}" no está instalado en esta organización.`,
      );
    }

    await this._checkInverseDependencies(organizationId, moduleKey);

    const requestId = randomUUID();
    const now = new Date();

    const job = await this.prisma.moduleInstallJob.create({
      data: {
        organizationId,
        moduleKey,
        operation: 'UNINSTALL',
        status: 'RUNNING',
        requestId,
        startedAt: now,
      },
      select: JOB_SELECT,
    });

    try {
      await this.prisma.tenantModuleInstallation.update({
        where: { organizationId_moduleKey: { organizationId, moduleKey } },
        data: { status: 'DISABLED' },
      });

      await this.prisma.moduleLifecycleAuditEvent.create({
        data: {
          organizationId,
          moduleKey,
          action: 'UNINSTALLED',
          actorUserId,
          beforeState: { status: 'INSTALLED' },
          afterState: { status: 'DISABLED' },
        },
      });

      this.logger.log(JSON.stringify({ event: 'MODULE_UNINSTALLED', organizationId, moduleKey }));

      return { ...job, status: 'COMPLETED' as const };
    } catch (err) {
      await this.prisma.moduleInstallJob.create({
        data: {
          organizationId,
          moduleKey,
          operation: 'UNINSTALL',
          status: 'FAILED',
          requestId: randomUUID(),
          startedAt: now,
          finishedAt: new Date(),
          logJson: { error: String(err) },
        },
      });
      throw err;
    }
  }

  async getJob(jobId: string, organizationId: string) {
    const job = await this.prisma.moduleInstallJob.findFirst({
      where: { id: jobId, organizationId },
      select: JOB_SELECT,
    });
    if (!job) {
      throw new NotFoundException(`Job "${jobId}" no encontrado.`);
    }
    return job;
  }

  private async _checkDependencies(organizationId: string, moduleKey: string) {
    const deps = await this.prisma.moduleDependency.findMany({
      where: { moduleKey, isHardDependency: true },
      select: { dependsOnModuleKey: true },
    });
    for (const dep of deps) {
      const inst = await this.prisma.tenantModuleInstallation.findFirst({
        where: {
          organizationId,
          moduleKey: dep.dependsOnModuleKey,
          status: 'INSTALLED',
        },
      });
      if (!inst) {
        throw new ConflictException(
          `El módulo "${moduleKey}" requiere que "${dep.dependsOnModuleKey}" esté instalado primero.`,
        );
      }
    }
  }

  private async _checkInverseDependencies(organizationId: string, moduleKey: string) {
    const dependents = await this.prisma.moduleDependency.findMany({
      where: { dependsOnModuleKey: moduleKey, isHardDependency: true },
      select: { moduleKey: true },
    });
    if (dependents.length === 0) return;

    for (const dep of dependents) {
      const inst = await this.prisma.tenantModuleInstallation.findFirst({
        where: { organizationId, moduleKey: dep.moduleKey, status: 'INSTALLED' },
      });
      if (inst) {
        throw new ConflictException(
          `No se puede desinstalar "${moduleKey}" porque el módulo "${dep.moduleKey}" depende de él.`,
        );
      }
    }
  }
}
