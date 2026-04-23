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
    findFirst: jest.fn(),
  },
  moduleLifecycleAuditEvent: {
    create: jest.fn(),
  },
};

describe('ModuleStoreService', () => {
  let service: ModuleStoreService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [ModuleStoreService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(ModuleStoreService);
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
});
