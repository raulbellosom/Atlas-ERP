import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AddVersionDto } from './dto/add-version.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { InstallModuleDto } from './dto/install.dto';
import { SetLifecycleDto } from './dto/set-lifecycle.dto';
import {
  findRemotePackageSecurityRecord,
  isRolloutStageAllowed,
  type RemoteRolloutStage,
  verifySignature,
} from './hybrid/remote-security.registry';
import {
  assertValidInteroperabilityContracts,
  getModuleInteroperabilityContract,
} from './interoperability/contracts';
import { UninstallModuleDto } from './dto/uninstall.dto';
import { UpgradeModuleDto } from './dto/upgrade.dto';

const CORE_MODULES = new Set(['core-platform']);
type CatalogProviderKind = 'curated' | 'remote_stub';

type RemoteCatalogVersionCandidate = {
  version: string;
  compatibilityRange?: string;
  manifestChecksum?: string;
  publishedAt?: string;
};

type RemoteCatalogModuleCandidate = {
  moduleKey: string;
  name?: string;
  description?: string | null;
  isCore?: boolean;
  lifecycleState?: string;
  createdAt?: string;
  versions: RemoteCatalogVersionCandidate[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function parseCommaSeparatedValues(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function parseRemoteCatalogRows(payload: unknown): RemoteCatalogModuleCandidate[] {
  const rowsRaw = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.items)
      ? payload.items
      : [];

  const parsed: RemoteCatalogModuleCandidate[] = [];

  for (const row of rowsRaw) {
    if (!isRecord(row) || typeof row.moduleKey !== 'string') {
      continue;
    }

    const versionsRaw = Array.isArray(row.versions) ? row.versions : [];
    const versions: RemoteCatalogVersionCandidate[] = [];

    for (const versionRow of versionsRaw) {
      if (!isRecord(versionRow) || typeof versionRow.version !== 'string') {
        continue;
      }

      versions.push({
        version: versionRow.version,
        compatibilityRange:
          typeof versionRow.compatibilityRange === 'string'
            ? versionRow.compatibilityRange
            : undefined,
        manifestChecksum:
          typeof versionRow.manifestChecksum === 'string' ? versionRow.manifestChecksum : undefined,
        publishedAt:
          typeof versionRow.publishedAt === 'string' ? versionRow.publishedAt : undefined,
      });
    }

    parsed.push({
      moduleKey: row.moduleKey,
      name: typeof row.name === 'string' ? row.name : undefined,
      description:
        typeof row.description === 'string' || row.description === null
          ? row.description
          : undefined,
      isCore: typeof row.isCore === 'boolean' ? row.isCore : undefined,
      lifecycleState: typeof row.lifecycleState === 'string' ? row.lifecycleState : undefined,
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : undefined,
      versions,
    });
  }

  return parsed;
}

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
  dependencies: {
    select: {
      dependsOnModuleKey: true,
      versionConstraint: true,
      isHardDependency: true,
    },
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

  constructor(private readonly prisma: PrismaService) {
    // Validate interoperability map at startup so invalid ownership/event contracts fail fast.
    assertValidInteroperabilityContracts();
  }

  async getCatalog(query: CatalogQueryDto) {
    const provider = this._resolveCatalogProvider();
    if (provider === 'remote_stub') {
      return this._getCatalogFromRemoteProvider(query);
    }
    return this._getCatalogFromCuratedProvider(query);
  }

  private async _getCatalogFromCuratedProvider(query: CatalogQueryDto) {
    const where: Prisma.ModuleDefinitionWhereInput = {
      ...(query.includeDeprecated ? {} : { lifecycleState: { not: 'DEPRECATED' } }),
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
    };

    const rows = await this.prisma.moduleDefinition.findMany({
      where,
      select: CATALOG_SELECT,
      orderBy: [{ isCore: 'desc' }, { name: 'asc' }],
    });

    return rows.map((row) => ({
      ...row,
      interoperability: getModuleInteroperabilityContract(row.moduleKey),
    }));
  }

  private async _getCatalogFromRemoteProvider(query: CatalogQueryDto) {
    const remoteCatalogUrl = process.env['MODULE_STORE_REMOTE_CATALOG_URL']?.trim();
    if (!remoteCatalogUrl) {
      this.logger.warn(
        JSON.stringify({
          event: 'MODULE_STORE_REMOTE_PROVIDER_STUB',
          message: 'Missing MODULE_STORE_REMOTE_CATALOG_URL, falling back to curated provider.',
        }),
      );
      return this._getCatalogFromCuratedProvider(query);
    }

    try {
      const url = new URL(remoteCatalogUrl);
      if (query.search) {
        url.searchParams.set('search', query.search);
      }
      if (query.includeDeprecated) {
        url.searchParams.set('includeDeprecated', 'true');
      }

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Remote catalog responded with status ${response.status}.`);
      }

      const payload: unknown = await response.json();
      const rows = parseRemoteCatalogRows(payload);
      return rows.map((row) => {
        const validatedVersions = row.versions.map((versionRow) => {
          const manifestChecksum = String(versionRow.manifestChecksum ?? '');
          this._verifyRemoteCatalogVersion({
            moduleKey: row.moduleKey,
            version: versionRow.version,
            manifestChecksum,
          });
          return {
            version: versionRow.version,
            compatibilityRange: versionRow.compatibilityRange ?? '>=1.0.0',
            publishedAt: versionRow.publishedAt ?? new Date().toISOString(),
          };
        });

        return {
          moduleKey: row.moduleKey,
          name: row.name ?? row.moduleKey,
          description: row.description ?? null,
          isCore: Boolean(row.isCore),
          lifecycleState: row.lifecycleState ?? 'ACTIVE',
          createdAt: row.createdAt ?? new Date().toISOString(),
          versions: validatedVersions,
          interoperability: getModuleInteroperabilityContract(row.moduleKey),
        };
      });
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'MODULE_STORE_REMOTE_PROVIDER_FALLBACK',
          message: `Remote catalog unavailable, fallback to curated provider: ${String(error)}`,
        }),
      );
      return this._getCatalogFromCuratedProvider(query);
    }
  }

  private _resolveCatalogProvider(): CatalogProviderKind {
    return process.env['MODULE_STORE_PROVIDER'] === 'remote' ? 'remote_stub' : 'curated';
  }

  private _getTrustedRemoteSigners(): string[] {
    const configured = parseCommaSeparatedValues(
      process.env['MODULE_STORE_REMOTE_TRUSTED_SIGNERS'],
    );
    if (configured.length > 0) {
      return configured;
    }
    return ['atlas-sign-v1'];
  }

  private _getCanaryOrganizationAllowlist(
    packageAllowlist: readonly string[] | undefined,
  ): Set<string> {
    const configured = parseCommaSeparatedValues(process.env['MODULE_STORE_REMOTE_CANARY_ORGS']);
    return new Set([...(packageAllowlist ?? []), ...configured]);
  }

  private _getPartialRolloutPercent(): number {
    const raw = Number(process.env['MODULE_STORE_REMOTE_PARTIAL_PERCENT'] ?? '');
    if (!Number.isFinite(raw)) return 100;
    return Math.max(0, Math.min(100, Math.floor(raw)));
  }

  private _isOrganizationInRolloutBucket(
    organizationId: string,
    thresholdPercent: number,
  ): boolean {
    let hash = 0;
    for (let index = 0; index < organizationId.length; index += 1) {
      hash = (hash * 31 + organizationId.charCodeAt(index)) >>> 0;
    }
    return hash % 100 < thresholdPercent;
  }

  private _isOrganizationAllowedForPackageRollout(input: {
    organizationId: string;
    packageStage: RemoteRolloutStage;
    packageAllowlist?: readonly string[];
  }): boolean {
    const canaryAllowlist = this._getCanaryOrganizationAllowlist(input.packageAllowlist);

    if (input.packageStage === 'total') {
      return true;
    }

    if (input.packageStage === 'canary') {
      return canaryAllowlist.has(input.organizationId);
    }

    if (canaryAllowlist.has(input.organizationId)) {
      return true;
    }

    return this._isOrganizationInRolloutBucket(
      input.organizationId,
      this._getPartialRolloutPercent(),
    );
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
    this._assertInteroperabilityContract(moduleKey);

    const existing = await this.prisma.tenantModuleInstallation.findFirst({
      where: { organizationId, moduleKey, status: { not: 'DISABLED' } },
    });
    if (existing) {
      throw new ConflictException(
        `El modulo "${moduleKey}" ya esta instalado en esta organizacion.`,
      );
    }

    await this._checkDependencies(organizationId, moduleKey);

    const moduleVersion = await this.prisma.moduleVersion.findFirst({
      where: { moduleKey, version },
      select: { version: true, manifestChecksum: true },
    });
    if (!moduleVersion) {
      throw new NotFoundException(`La version "${version}" del modulo "${moduleKey}" no existe.`);
    }

    this._verifyHybridRemoteSecurity({
      organizationId,
      moduleKey,
      version,
      manifestChecksum: moduleVersion.manifestChecksum,
    });

    const requestId = dto.requestId ?? randomUUID();
    if (dto.requestId) {
      const existingJob = await this.prisma.moduleInstallJob.findFirst({
        where: { requestId },
        select: JOB_SELECT,
      });
      if (existingJob) {
        return existingJob;
      }
    }

    const job = await this.prisma.moduleInstallJob.create({
      data: {
        organizationId,
        moduleKey,
        operation: 'INSTALL',
        status: 'RUNNING',
        requestId,
        startedAt: new Date(),
      },
      select: JOB_SELECT,
    });

    try {
      await this.prisma.tenantModuleInstallation.create({
        data: { organizationId, moduleKey, version, status: 'INSTALLED' },
      });

      const completedJob = await this.prisma.moduleInstallJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          finishedAt: new Date(),
        },
        select: JOB_SELECT,
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

      return completedJob;
    } catch (err) {
      await this.prisma.moduleInstallJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          logJson: { error: String(err) },
        },
      });
      throw err;
    }
  }

  async uninstall(dto: UninstallModuleDto, actorUserId: string) {
    const { organizationId, moduleKey } = dto;
    this._assertInteroperabilityContract(moduleKey);

    if (CORE_MODULES.has(moduleKey)) {
      throw new ConflictException(`El modulo "${moduleKey}" es nucleo y no puede desinstalarse.`);
    }

    const installation = await this.prisma.tenantModuleInstallation.findFirst({
      where: { organizationId, moduleKey, status: 'INSTALLED' },
    });
    if (!installation) {
      throw new NotFoundException(
        `El modulo "${moduleKey}" no esta instalado en esta organizacion.`,
      );
    }

    await this._checkInverseDependencies(organizationId, moduleKey);

    const requestId = dto.requestId ?? randomUUID();
    if (dto.requestId) {
      const existingJob = await this.prisma.moduleInstallJob.findFirst({
        where: { requestId },
        select: JOB_SELECT,
      });
      if (existingJob) {
        return existingJob;
      }
    }

    const job = await this.prisma.moduleInstallJob.create({
      data: {
        organizationId,
        moduleKey,
        operation: 'UNINSTALL',
        status: 'RUNNING',
        requestId,
        startedAt: new Date(),
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

      return await this.prisma.moduleInstallJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          finishedAt: new Date(),
        },
        select: JOB_SELECT,
      });
    } catch (err) {
      await this.prisma.moduleInstallJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          logJson: { error: String(err) },
        },
      });
      throw err;
    }
  }

  async upgrade(dto: UpgradeModuleDto, actorUserId: string) {
    const { organizationId, moduleKey, fromVersion, toVersion } = dto;
    this._assertInteroperabilityContract(moduleKey);

    if (fromVersion === toVersion) {
      throw new ConflictException(
        `La version origen y destino del modulo "${moduleKey}" no pueden ser iguales.`,
      );
    }

    const installation = await this.prisma.tenantModuleInstallation.findFirst({
      where: { organizationId, moduleKey, status: 'INSTALLED' },
      select: { version: true },
    });
    if (!installation) {
      throw new NotFoundException(
        `El modulo "${moduleKey}" no esta instalado en esta organizacion.`,
      );
    }
    if (installation.version !== fromVersion) {
      throw new ConflictException(
        `La version actual instalada (${installation.version}) no coincide con fromVersion (${fromVersion}).`,
      );
    }

    const targetVersion = await this.prisma.moduleVersion.findFirst({
      where: { moduleKey, version: toVersion },
      select: { version: true, manifestChecksum: true },
    });
    if (!targetVersion) {
      throw new NotFoundException(
        `La version destino "${toVersion}" del modulo "${moduleKey}" no existe.`,
      );
    }

    this._verifyHybridRemoteSecurity({
      organizationId,
      moduleKey,
      version: toVersion,
      manifestChecksum: targetVersion.manifestChecksum,
    });

    await this._checkDependencies(organizationId, moduleKey);

    const requestId = dto.requestId ?? randomUUID();
    if (dto.requestId) {
      const existingJob = await this.prisma.moduleInstallJob.findFirst({
        where: { requestId },
        select: JOB_SELECT,
      });
      if (existingJob) {
        return existingJob;
      }
    }

    const job = await this.prisma.moduleInstallJob.create({
      data: {
        organizationId,
        moduleKey,
        operation: 'UPGRADE',
        status: 'RUNNING',
        requestId,
        startedAt: new Date(),
      },
      select: JOB_SELECT,
    });

    try {
      await this.prisma.tenantModuleInstallation.update({
        where: { organizationId_moduleKey: { organizationId, moduleKey } },
        data: { status: 'UPGRADING' },
      });

      await this.prisma.tenantModuleInstallation.update({
        where: { organizationId_moduleKey: { organizationId, moduleKey } },
        data: { version: toVersion, status: 'INSTALLED' },
      });

      const completedJob = await this.prisma.moduleInstallJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          finishedAt: new Date(),
        },
        select: JOB_SELECT,
      });

      await this.prisma.moduleLifecycleAuditEvent.create({
        data: {
          organizationId,
          moduleKey,
          action: 'UPGRADED',
          actorUserId,
          beforeState: { version: fromVersion, status: 'INSTALLED' },
          afterState: { version: toVersion, status: 'INSTALLED' },
        },
      });

      this.logger.log(
        JSON.stringify({
          event: 'MODULE_UPGRADED',
          organizationId,
          moduleKey,
          fromVersion,
          toVersion,
        }),
      );

      return completedJob;
    } catch (err) {
      await this.prisma.tenantModuleInstallation.update({
        where: { organizationId_moduleKey: { organizationId, moduleKey } },
        data: { version: fromVersion, status: 'INSTALLED' },
      });

      await this.prisma.moduleInstallJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
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

  async setLifecycle(moduleKey: string, dto: SetLifecycleDto) {
    const existing = await this.prisma.moduleDefinition.findFirst({
      where: { moduleKey },
      select: { moduleKey: true },
    });
    if (!existing) {
      throw new NotFoundException(`Módulo "${moduleKey}" no encontrado en el catálogo.`);
    }
    return this.prisma.moduleDefinition.update({
      where: { moduleKey },
      data: { lifecycleState: dto.lifecycleState },
      select: { moduleKey: true, name: true, lifecycleState: true },
    });
  }

  async addVersion(moduleKey: string, dto: AddVersionDto) {
    const existing = await this.prisma.moduleDefinition.findFirst({
      where: { moduleKey },
      select: { moduleKey: true },
    });
    if (!existing) {
      throw new NotFoundException(`Módulo "${moduleKey}" no encontrado en el catálogo.`);
    }
    const conflict = await this.prisma.moduleVersion.findFirst({
      where: { moduleKey, version: dto.version },
    });
    if (conflict) {
      throw new ConflictException(
        `La versión "${dto.version}" ya existe para el módulo "${moduleKey}".`,
      );
    }
    return this.prisma.moduleVersion.create({
      data: {
        moduleKey,
        version: dto.version,
        compatibilityRange: dto.compatibilityRange,
        manifestChecksum: dto.manifestChecksum,
      },
      select: {
        id: true,
        moduleKey: true,
        version: true,
        compatibilityRange: true,
        publishedAt: true,
      },
    });
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
          `El modulo "${moduleKey}" requiere que "${dep.dependsOnModuleKey}" este instalado primero.`,
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
          `No se puede desinstalar "${moduleKey}" porque el modulo "${dep.moduleKey}" depende de el.`,
        );
      }
    }
  }

  private _assertInteroperabilityContract(moduleKey: string) {
    const contract = getModuleInteroperabilityContract(moduleKey);
    if (!contract) {
      throw new ConflictException(
        `No existe contrato de interoperabilidad para el modulo "${moduleKey}".`,
      );
    }
  }

  private _verifyHybridRemoteSecurity(input: {
    organizationId: string;
    moduleKey: string;
    version: string;
    manifestChecksum: string;
  }) {
    if (!this._isRemoteProviderEnabled()) {
      return;
    }

    const securityRecord = findRemotePackageSecurityRecord(input.moduleKey, input.version);
    if (!securityRecord) {
      throw new ConflictException(
        `No existe metadata de seguridad para paquete remoto ${input.moduleKey}@${input.version}.`,
      );
    }

    if (securityRecord.checksum !== input.manifestChecksum) {
      throw new ConflictException(
        `Checksum invalido para paquete remoto ${input.moduleKey}@${input.version}.`,
      );
    }

    if (
      !verifySignature(
        securityRecord.checksum,
        securityRecord.signature,
        this._getTrustedRemoteSigners(),
      )
    ) {
      throw new ConflictException(
        `Firma invalida para paquete remoto ${input.moduleKey}@${input.version}.`,
      );
    }

    const activeStage = this._getRemoteRolloutStage();
    if (!isRolloutStageAllowed(activeStage, securityRecord.rolloutStage)) {
      throw new ConflictException(
        `Paquete ${input.moduleKey}@${input.version} fuera de etapa de rollout (${activeStage}).`,
      );
    }

    if (
      !this._isOrganizationAllowedForPackageRollout({
        organizationId: input.organizationId,
        packageStage: securityRecord.rolloutStage,
        packageAllowlist: securityRecord.allowedOrganizationIds,
      })
    ) {
      throw new ConflictException(
        `Paquete ${input.moduleKey}@${input.version} no habilitado para la organizacion en la etapa de rollout.`,
      );
    }
  }

  private _isRemoteProviderEnabled(): boolean {
    return this._resolveCatalogProvider() === 'remote_stub';
  }

  private _verifyRemoteCatalogVersion(input: {
    moduleKey: string;
    version: string;
    manifestChecksum: string;
  }) {
    const securityRecord = findRemotePackageSecurityRecord(input.moduleKey, input.version);
    if (!securityRecord) {
      throw new ConflictException(
        `No existe metadata de seguridad para catalogo remoto ${input.moduleKey}@${input.version}.`,
      );
    }

    if (securityRecord.checksum !== input.manifestChecksum) {
      throw new ConflictException(
        `Checksum invalido para catalogo remoto ${input.moduleKey}@${input.version}.`,
      );
    }

    if (
      !verifySignature(
        securityRecord.checksum,
        securityRecord.signature,
        this._getTrustedRemoteSigners(),
      )
    ) {
      throw new ConflictException(
        `Firma invalida para catalogo remoto ${input.moduleKey}@${input.version}.`,
      );
    }

    const activeStage = this._getRemoteRolloutStage();
    if (!isRolloutStageAllowed(activeStage, securityRecord.rolloutStage)) {
      throw new ConflictException(
        `Version remota ${input.moduleKey}@${input.version} fuera de rollout (${activeStage}).`,
      );
    }
  }

  private _getRemoteRolloutStage(): RemoteRolloutStage {
    const stage = process.env['MODULE_STORE_REMOTE_ROLLOUT_STAGE'];
    if (stage === 'canary' || stage === 'partial' || stage === 'total') {
      return stage;
    }
    return 'total';
  }
}
