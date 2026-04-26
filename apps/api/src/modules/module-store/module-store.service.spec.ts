import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ModuleStoreService } from './module-store.service';

const mockPrisma = {
  moduleDefinition: {
    findMany: jest.fn(),
  },
  tenantModuleInstallation: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  moduleVersion: {
    findFirst: jest.fn(),
  },
  moduleDependency: {
    findMany: jest.fn(),
  },
  moduleInstallJob: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  moduleLifecycleAuditEvent: {
    create: jest.fn(),
  },
};

describe('ModuleStoreService', () => {
  let service: ModuleStoreService;
  const originalProvider = process.env.MODULE_STORE_PROVIDER;
  const originalRolloutStage = process.env.MODULE_STORE_REMOTE_ROLLOUT_STAGE;
  const originalRemoteCatalogUrl = process.env.MODULE_STORE_REMOTE_CATALOG_URL;
  const originalTrustedSigners = process.env.MODULE_STORE_REMOTE_TRUSTED_SIGNERS;
  const originalCanaryOrgs = process.env.MODULE_STORE_REMOTE_CANARY_ORGS;
  const originalPartialPercent = process.env.MODULE_STORE_REMOTE_PARTIAL_PERCENT;

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.MODULE_STORE_PROVIDER;
    delete process.env.MODULE_STORE_REMOTE_ROLLOUT_STAGE;
    delete process.env.MODULE_STORE_REMOTE_CATALOG_URL;
    delete process.env.MODULE_STORE_REMOTE_TRUSTED_SIGNERS;
    delete process.env.MODULE_STORE_REMOTE_CANARY_ORGS;
    delete process.env.MODULE_STORE_REMOTE_PARTIAL_PERCENT;
    const module = await Test.createTestingModule({
      providers: [ModuleStoreService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(ModuleStoreService);
  });

  afterAll(() => {
    process.env.MODULE_STORE_PROVIDER = originalProvider;
    process.env.MODULE_STORE_REMOTE_ROLLOUT_STAGE = originalRolloutStage;
    process.env.MODULE_STORE_REMOTE_CATALOG_URL = originalRemoteCatalogUrl;
    process.env.MODULE_STORE_REMOTE_TRUSTED_SIGNERS = originalTrustedSigners;
    process.env.MODULE_STORE_REMOTE_CANARY_ORGS = originalCanaryOrgs;
    process.env.MODULE_STORE_REMOTE_PARTIAL_PERCENT = originalPartialPercent;
  });

  describe('getCatalog', () => {
    it('returns all active modules', async () => {
      mockPrisma.moduleDefinition.findMany.mockResolvedValue([
        {
          moduleKey: 'core-platform',
          name: 'Core Platform',
          lifecycleState: 'ACTIVE',
          isCore: true,
          versions: [],
        },
      ]);
      const result = await service.getCatalog({});
      expect(result).toHaveLength(1);
      expect(result[0].moduleKey).toBe('core-platform');
    });

    it('filters by search term', async () => {
      mockPrisma.moduleDefinition.findMany.mockResolvedValue([]);
      await service.getCatalog({ search: 'accounting' });
      expect(mockPrisma.moduleDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.objectContaining({ contains: 'accounting' }),
          }),
        }),
      );
    });

    it('falls back to curated provider when remote provider has no configured URL', async () => {
      process.env.MODULE_STORE_PROVIDER = 'remote';

      mockPrisma.moduleDefinition.findMany.mockResolvedValue([
        {
          moduleKey: 'core-platform',
          name: 'Core Platform',
          lifecycleState: 'ACTIVE',
          isCore: true,
          versions: [],
        },
      ]);

      const result = await service.getCatalog({});
      expect(result).toHaveLength(1);
      expect(mockPrisma.moduleDefinition.findMany).toHaveBeenCalledTimes(1);
    });

    it('loads catalog from remote provider and validates package metadata', async () => {
      process.env.MODULE_STORE_PROVIDER = 'remote';
      process.env.MODULE_STORE_REMOTE_CATALOG_URL = 'https://catalog.atlaserp.local/modules';
      process.env.MODULE_STORE_REMOTE_ROLLOUT_STAGE = 'total';

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          items: [
            {
              moduleKey: 'core-platform',
              name: 'Core Platform Remote',
              isCore: true,
              lifecycleState: 'ACTIVE',
              versions: [
                {
                  version: '1.0.0',
                  compatibilityRange: '^1.0.0',
                  manifestChecksum: 'curated-v1',
                },
              ],
            },
          ],
        }),
      } as unknown as Response);

      const result = await service.getCatalog({});
      expect(result).toHaveLength(1);
      expect(result[0].moduleKey).toBe('core-platform');
      expect(result[0].versions).toHaveLength(1);
      fetchSpy.mockRestore();
    });
  });

  describe('getInstalled', () => {
    it('returns installed modules for org', async () => {
      mockPrisma.tenantModuleInstallation.findMany.mockResolvedValue([
        { moduleKey: 'accounting', version: '1.0.0', status: 'INSTALLED' },
      ]);
      const result = await service.getInstalled('org-1');
      expect(result).toHaveLength(1);
      expect(result[0].moduleKey).toBe('accounting');
    });
  });

  describe('install', () => {
    it('rejects remote package without security metadata when provider is remote', async () => {
      process.env.MODULE_STORE_PROVIDER = 'remote';
      process.env.MODULE_STORE_REMOTE_ROLLOUT_STAGE = 'total';

      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleVersion.findFirst.mockResolvedValue({
        moduleKey: 'hr',
        version: '2.0.0',
        manifestChecksum: 'checksum-hr-2-0-0',
      });

      await expect(
        service.install({ organizationId: 'org-1', moduleKey: 'hr', version: '2.0.0' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('enforces canary organization allowlist for remote packages', async () => {
      process.env.MODULE_STORE_PROVIDER = 'remote';
      process.env.MODULE_STORE_REMOTE_ROLLOUT_STAGE = 'total';

      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleVersion.findFirst.mockResolvedValue({
        moduleKey: 'accounting',
        version: '1.0.0',
        manifestChecksum: 'curated-v1',
      });

      await expect(
        service.install(
          { organizationId: 'org-not-canary', moduleKey: 'accounting', version: '1.0.0' },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if module has no interoperability contract', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleVersion.findFirst.mockResolvedValue({
        moduleKey: 'custom-module',
        version: '1.0.0',
      });

      await expect(
        service.install(
          { organizationId: 'org-1', moduleKey: 'custom-module', version: '1.0.0' },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('accepts canary package for organization enabled through dynamic allowlist', async () => {
      process.env.MODULE_STORE_PROVIDER = 'remote';
      process.env.MODULE_STORE_REMOTE_ROLLOUT_STAGE = 'total';
      process.env.MODULE_STORE_REMOTE_CANARY_ORGS = 'org-dynamic-canary';

      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleVersion.findFirst.mockResolvedValue({
        moduleKey: 'accounting',
        version: '1.0.0',
        manifestChecksum: 'curated-v1',
      });
      mockPrisma.moduleInstallJob.create.mockResolvedValue({
        id: 'job-canary-allow',
        status: 'RUNNING',
      });
      mockPrisma.moduleInstallJob.update.mockResolvedValue({
        id: 'job-canary-allow',
        status: 'COMPLETED',
      });
      mockPrisma.tenantModuleInstallation.create.mockResolvedValue({});
      mockPrisma.moduleLifecycleAuditEvent.create.mockResolvedValue({});

      const result = await service.install(
        { organizationId: 'org-dynamic-canary', moduleKey: 'accounting', version: '1.0.0' },
        'user-1',
      );

      expect(result.status).toBe('COMPLETED');
    });

    it('blocks partial rollout package when deterministic segment is disabled', async () => {
      process.env.MODULE_STORE_PROVIDER = 'remote';
      process.env.MODULE_STORE_REMOTE_ROLLOUT_STAGE = 'total';
      process.env.MODULE_STORE_REMOTE_PARTIAL_PERCENT = '0';

      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleVersion.findFirst.mockResolvedValue({
        moduleKey: 'financial-operations',
        version: '1.0.0',
        manifestChecksum: 'curated-v1',
      });

      await expect(
        service.install(
          {
            organizationId: 'org-partial-disabled',
            moduleKey: 'financial-operations',
            version: '1.0.0',
          },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects package when signer is not part of trusted signer list', async () => {
      process.env.MODULE_STORE_PROVIDER = 'remote';
      process.env.MODULE_STORE_REMOTE_ROLLOUT_STAGE = 'total';
      process.env.MODULE_STORE_REMOTE_TRUSTED_SIGNERS = 'external-sign-v2';

      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleVersion.findFirst.mockResolvedValue({
        moduleKey: 'accounting',
        version: '1.0.0',
        manifestChecksum: 'curated-v1',
      });

      await expect(
        service.install({ organizationId: 'org-1', moduleKey: 'accounting', version: '1.0.0' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('returns existing job when requestId already exists (idempotent)', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleVersion.findFirst.mockResolvedValue({
        moduleKey: 'accounting',
        version: '1.0.0',
      });
      mockPrisma.moduleInstallJob.findFirst.mockResolvedValue({
        id: 'job-existing',
        status: 'COMPLETED',
        requestId: 'req-123',
      });

      const result = await service.install(
        {
          organizationId: 'org-1',
          moduleKey: 'accounting',
          version: '1.0.0',
          requestId: 'req-123',
        },
        'user-1',
      );

      expect(result.id).toBe('job-existing');
      expect(mockPrisma.moduleInstallJob.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException if module already installed', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue({
        moduleKey: 'accounting',
        status: 'INSTALLED',
      });
      await expect(
        service.install(
          { organizationId: 'org-1', moduleKey: 'accounting', version: '1.0.0' },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException if version not found', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleVersion.findFirst.mockResolvedValue(null);
      await expect(
        service.install(
          { organizationId: 'org-1', moduleKey: 'accounting', version: '9.9.9' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates installation and job record on success', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleVersion.findFirst.mockResolvedValue({
        moduleKey: 'accounting',
        version: '1.0.0',
      });
      mockPrisma.moduleInstallJob.create.mockResolvedValue({
        id: 'job-1',
        status: 'RUNNING',
      });
      mockPrisma.moduleInstallJob.update.mockResolvedValue({
        id: 'job-1',
        status: 'COMPLETED',
      });
      mockPrisma.tenantModuleInstallation.create.mockResolvedValue({});
      mockPrisma.moduleLifecycleAuditEvent.create.mockResolvedValue({});
      const result = await service.install(
        { organizationId: 'org-1', moduleKey: 'accounting', version: '1.0.0' },
        'user-1',
      );
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('uninstall', () => {
    it('throws NotFoundException if not installed', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);
      await expect(
        service.uninstall({ organizationId: 'org-1', moduleKey: 'accounting' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if module is core', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue({
        moduleKey: 'core-platform',
        status: 'INSTALLED',
      });
      await expect(
        service.uninstall({ organizationId: 'org-1', moduleKey: 'core-platform' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('disables installation and creates job on success', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue({
        moduleKey: 'accounting',
        status: 'INSTALLED',
      });
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleInstallJob.create.mockResolvedValue({
        id: 'job-2',
        status: 'RUNNING',
      });
      mockPrisma.moduleInstallJob.update.mockResolvedValue({
        id: 'job-2',
        status: 'COMPLETED',
      });
      mockPrisma.tenantModuleInstallation.update.mockResolvedValue({});
      mockPrisma.moduleLifecycleAuditEvent.create.mockResolvedValue({});
      const result = await service.uninstall(
        { organizationId: 'org-1', moduleKey: 'accounting' },
        'user-1',
      );
      expect(result.status).toBe('COMPLETED');
    });

    it('throws ConflictException if another module depends on it', async () => {
      mockPrisma.tenantModuleInstallation.findFirst
        .mockResolvedValueOnce({ moduleKey: 'accounting', status: 'INSTALLED' })
        .mockResolvedValueOnce({ moduleKey: 'payroll', status: 'INSTALLED' });
      mockPrisma.moduleDependency.findMany.mockResolvedValue([
        { moduleKey: 'payroll', dependsOnModuleKey: 'accounting', isHardDependency: true },
      ]);
      await expect(
        service.uninstall({ organizationId: 'org-1', moduleKey: 'accounting' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getJob', () => {
    it('throws NotFoundException if job not found', async () => {
      mockPrisma.moduleInstallJob.findFirst.mockResolvedValue(null);
      await expect(service.getJob('bad-id', 'org-1')).rejects.toThrow(NotFoundException);
    });

    it('returns job if found', async () => {
      mockPrisma.moduleInstallJob.findFirst.mockResolvedValue({
        id: 'job-1',
        status: 'COMPLETED',
      });
      const result = await service.getJob('job-1', 'org-1');
      expect(result.id).toBe('job-1');
    });
  });

  describe('upgrade', () => {
    it('throws NotFoundException if module is not installed', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue(null);

      await expect(
        service.upgrade(
          {
            organizationId: 'org-1',
            moduleKey: 'accounting',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
          },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if fromVersion does not match installed version', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue({ version: '1.0.1' });

      await expect(
        service.upgrade(
          {
            organizationId: 'org-1',
            moduleKey: 'accounting',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
          },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('upgrades module and returns completed job', async () => {
      mockPrisma.tenantModuleInstallation.findFirst.mockResolvedValue({ version: '1.0.0' });
      mockPrisma.moduleVersion.findFirst.mockResolvedValue({ version: '1.1.0' });
      mockPrisma.moduleDependency.findMany.mockResolvedValue([]);
      mockPrisma.moduleInstallJob.create.mockResolvedValue({
        id: 'job-upgrade-1',
        status: 'RUNNING',
      });
      mockPrisma.moduleInstallJob.update.mockResolvedValue({
        id: 'job-upgrade-1',
        status: 'COMPLETED',
      });
      mockPrisma.tenantModuleInstallation.update.mockResolvedValue({});
      mockPrisma.moduleLifecycleAuditEvent.create.mockResolvedValue({});

      const result = await service.upgrade(
        {
          organizationId: 'org-1',
          moduleKey: 'accounting',
          fromVersion: '1.0.0',
          toVersion: '1.1.0',
        },
        'user-1',
      );

      expect(result.status).toBe('COMPLETED');
      expect(mockPrisma.tenantModuleInstallation.update).toHaveBeenCalled();
    });
  });
});
