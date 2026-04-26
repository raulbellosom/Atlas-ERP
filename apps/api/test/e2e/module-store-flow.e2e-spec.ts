import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { AppModule } from '../../src/modules/app/app.module';
import { generateTestToken } from '../helpers/auth.helper';

const ORG_ID = 'org-e2e-module-store';
const USER_ID = 'user-e2e-module-store-admin';
const ROLE_NAME = 'module-store-admin';

const MODULE_CORE = 'core-platform';
const MODULE_ACCOUNTING = 'accounting';
const VERSION_1_0_0 = '1.0.0';
const VERSION_1_1_0 = '1.1.0';

const MODULE_STORE_PERMISSIONS = [
  { key: 'module_store:read', action: 'read' },
  { key: 'module_store:install', action: 'install' },
  { key: 'module_store:uninstall', action: 'uninstall' },
  { key: 'module_store:upgrade', action: 'upgrade' },
] as const;

describe('E2E Module Store flow', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    delete process.env.DISABLE_AUTH_GUARDS;
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ?? 'test-secret-atlas-erp-integration';

    prisma = new PrismaClient();

    await prisma.organization.upsert({
      where: { id: ORG_ID },
      update: {},
      create: {
        id: ORG_ID,
        name: 'Org E2E Module Store',
        slug: 'org-e2e-module-store',
      },
    });

    await prisma.moduleLifecycleAuditEvent.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.moduleInstallJob.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.tenantModuleInstallation.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.moduleDependency.deleteMany({
      where: {
        OR: [
          { moduleKey: MODULE_ACCOUNTING },
          { dependsOnModuleKey: MODULE_ACCOUNTING },
          { moduleKey: MODULE_CORE },
          { dependsOnModuleKey: MODULE_CORE },
        ],
      },
    });
    await prisma.moduleVersion.deleteMany({
      where: { moduleKey: { in: [MODULE_ACCOUNTING, MODULE_CORE] } },
    });
    await prisma.moduleDefinition.deleteMany({
      where: { moduleKey: { in: [MODULE_ACCOUNTING, MODULE_CORE] } },
    });

    await prisma.moduleDefinition.createMany({
      data: [
        {
          moduleKey: MODULE_CORE,
          name: 'Core Platform',
          description: 'Core module',
          isCore: true,
          lifecycleState: 'ACTIVE',
        },
        {
          moduleKey: MODULE_ACCOUNTING,
          name: 'Accounting',
          description: 'Accounting module',
          isCore: false,
          lifecycleState: 'ACTIVE',
        },
      ],
    });

    await prisma.moduleVersion.createMany({
      data: [
        {
          moduleKey: MODULE_CORE,
          version: VERSION_1_0_0,
          compatibilityRange: '^1.0.0',
          manifestChecksum: 'checksum-core-1-0-0',
        },
        {
          moduleKey: MODULE_ACCOUNTING,
          version: VERSION_1_0_0,
          compatibilityRange: '^1.0.0',
          manifestChecksum: 'checksum-accounting-1-0-0',
        },
        {
          moduleKey: MODULE_ACCOUNTING,
          version: VERSION_1_1_0,
          compatibilityRange: '^1.0.0',
          manifestChecksum: 'checksum-accounting-1-1-0',
        },
      ],
    });

    await prisma.moduleDependency.create({
      data: {
        moduleKey: MODULE_ACCOUNTING,
        dependsOnModuleKey: MODULE_CORE,
        versionConstraint: '^1.0.0',
        isHardDependency: true,
      },
    });

    await prisma.tenantModuleInstallation.create({
      data: {
        organizationId: ORG_ID,
        moduleKey: MODULE_CORE,
        version: VERSION_1_0_0,
        status: 'INSTALLED',
      },
    });

    const role = await prisma.role.upsert({
      where: {
        organizationId_name: { organizationId: ORG_ID, name: ROLE_NAME },
      },
      update: {
        isActive: true,
        deletedAt: null,
      },
      create: {
        organizationId: ORG_ID,
        name: ROLE_NAME,
        description: 'Role for module store e2e',
        level: 90,
        isActive: true,
      },
    });

    for (const permission of MODULE_STORE_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { key: permission.key },
        update: {
          module: 'module_store',
          action: permission.action,
          isActive: true,
        },
        create: {
          key: permission.key,
          module: 'module_store',
          action: permission.action,
          description: `E2E permission ${permission.key}`,
          isActive: true,
        },
      });
    }

    const permissionRows = await prisma.permission.findMany({
      where: {
        key: { in: MODULE_STORE_PERMISSIONS.map((permission) => permission.key) },
      },
      select: { id: true },
    });

    for (const permissionRow of permissionRows) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permissionRow.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permissionRow.id,
        },
      });
    }

    await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: ORG_ID,
          email: 'module.store.admin@atlaserp.local',
        },
      },
      update: {
        id: USER_ID,
        displayName: 'Module Store Admin',
        isActive: true,
      },
      create: {
        id: USER_ID,
        organizationId: ORG_ID,
        email: 'module.store.admin@atlaserp.local',
        displayName: 'Module Store Admin',
        isActive: true,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: USER_ID,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: USER_ID,
        roleId: role.id,
      },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('runs catalog -> install -> upgrade -> uninstall flow', async () => {
    const token = generateTestToken({
      sub: USER_ID,
      organizationId: ORG_ID,
      branchId: null,
    });

    const catalogRes = await supertest(app.getHttpServer())
      .get('/v1/module-store/catalog')
      .set('Authorization', `Bearer ${token}`);
    expect(catalogRes.status).toBe(200);

    const installRes = await supertest(app.getHttpServer())
      .post('/v1/module-store/install')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organizationId: ORG_ID,
        moduleKey: MODULE_ACCOUNTING,
        version: VERSION_1_0_0,
        requestId: 'req-e2e-install-accounting-1-0-0',
      });
    expect(installRes.status).toBe(201);
    expect(installRes.body.status).toBe('COMPLETED');

    const upgradeRes = await supertest(app.getHttpServer())
      .post('/v1/module-store/upgrade')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organizationId: ORG_ID,
        moduleKey: MODULE_ACCOUNTING,
        fromVersion: VERSION_1_0_0,
        toVersion: VERSION_1_1_0,
        requestId: 'req-e2e-upgrade-accounting-1-1-0',
      });
    expect(upgradeRes.status).toBe(201);
    expect(upgradeRes.body.status).toBe('COMPLETED');

    const uninstallRes = await supertest(app.getHttpServer())
      .post('/v1/module-store/uninstall')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organizationId: ORG_ID,
        moduleKey: MODULE_ACCOUNTING,
        requestId: 'req-e2e-uninstall-accounting-1-1-0',
      });
    expect(uninstallRes.status).toBe(201);
    expect(uninstallRes.body.status).toBe('COMPLETED');

    const installedRes = await supertest(app.getHttpServer())
      .get('/v1/module-store/installed')
      .set('Authorization', `Bearer ${token}`);
    expect(installedRes.status).toBe(200);
    expect(
      installedRes.body.some(
        (row: { moduleKey: string; status: string }) =>
          row.moduleKey === MODULE_ACCOUNTING && row.status === 'DISABLED',
      ),
    ).toBe(true);
  });
});
