import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { AppModule } from '../../src/modules/app/app.module';
import { generateTestToken } from '../helpers/auth.helper';

const ORG_ID = 'org-e2e-hr-accounting-perms';
const READER_USER_ID = 'user-e2e-reader-hr-accounting';
const ADMIN_USER_ID = 'user-e2e-admin-hr-accounting';
const READER_ROLE = 'mod-reader';
const ADMIN_ROLE = 'mod-admin';

const PERMISSIONS = [
  { key: 'hr:read', module: 'hr', action: 'read' },
  { key: 'hr:write', module: 'hr', action: 'write' },
  { key: 'hr:admin', module: 'hr', action: 'admin' },
  { key: 'accounting:read', module: 'accounting', action: 'read' },
  { key: 'accounting:write', module: 'accounting', action: 'write' },
  { key: 'accounting:admin', module: 'accounting', action: 'admin' },
] as const;

describe('E2E HR/Accounting permissions with real guards', () => {
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
        name: 'Org E2E HR Accounting',
        slug: 'org-e2e-hr-accounting-perms',
      },
    });

    await prisma.department.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.chartOfAccount.deleteMany({ where: { organizationId: ORG_ID } });

    const readerRole = await prisma.role.upsert({
      where: {
        organizationId_name: { organizationId: ORG_ID, name: READER_ROLE },
      },
      update: {
        isActive: true,
        deletedAt: null,
        level: 10,
      },
      create: {
        organizationId: ORG_ID,
        name: READER_ROLE,
        description: 'Read-only for HR and Accounting',
        level: 10,
        isActive: true,
      },
    });

    const adminRole = await prisma.role.upsert({
      where: {
        organizationId_name: { organizationId: ORG_ID, name: ADMIN_ROLE },
      },
      update: {
        isActive: true,
        deletedAt: null,
        level: 100,
      },
      create: {
        organizationId: ORG_ID,
        name: ADMIN_ROLE,
        description: 'Admin for HR and Accounting',
        level: 100,
        isActive: true,
      },
    });

    for (const permission of PERMISSIONS) {
      await prisma.permission.upsert({
        where: { key: permission.key },
        update: {
          module: permission.module,
          action: permission.action,
          isActive: true,
        },
        create: {
          key: permission.key,
          module: permission.module,
          action: permission.action,
          description: `E2E permission ${permission.key}`,
          isActive: true,
        },
      });
    }

    const permissionRows = await prisma.permission.findMany({
      where: { key: { in: PERMISSIONS.map((permission) => permission.key) } },
      select: { id: true, key: true },
    });
    const permissionByKey = new Map(
      permissionRows.map((permission) => [permission.key, permission.id]),
    );

    const readerPermissionKeys = ['hr:read', 'accounting:read'];
    const adminPermissionKeys = PERMISSIONS.map((permission) => permission.key);

    for (const key of readerPermissionKeys) {
      const permissionId = permissionByKey.get(key);
      if (!permissionId) {
        throw new Error(`Permission missing for reader role: ${key}`);
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: readerRole.id,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId: readerRole.id,
          permissionId,
        },
      });
    }

    for (const key of adminPermissionKeys) {
      const permissionId = permissionByKey.get(key);
      if (!permissionId) {
        throw new Error(`Permission missing for admin role: ${key}`);
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId,
        },
      });
    }

    await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: ORG_ID,
          email: 'reader.hr.accounting@atlaserp.local',
        },
      },
      update: {
        id: READER_USER_ID,
        displayName: 'Reader HR Accounting',
        isActive: true,
      },
      create: {
        id: READER_USER_ID,
        organizationId: ORG_ID,
        email: 'reader.hr.accounting@atlaserp.local',
        displayName: 'Reader HR Accounting',
        isActive: true,
      },
    });

    await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: ORG_ID,
          email: 'admin.hr.accounting@atlaserp.local',
        },
      },
      update: {
        id: ADMIN_USER_ID,
        displayName: 'Admin HR Accounting',
        isActive: true,
      },
      create: {
        id: ADMIN_USER_ID,
        organizationId: ORG_ID,
        email: 'admin.hr.accounting@atlaserp.local',
        displayName: 'Admin HR Accounting',
        isActive: true,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: READER_USER_ID,
          roleId: readerRole.id,
        },
      },
      update: {},
      create: {
        userId: READER_USER_ID,
        roleId: readerRole.id,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: ADMIN_USER_ID,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: ADMIN_USER_ID,
        roleId: adminRole.id,
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
    await prisma.department.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.chartOfAccount.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.$disconnect();
    await app.close();
  });

  it('reader can GET HR departments and Accounting chart endpoints', async () => {
    const readerToken = generateTestToken({
      sub: READER_USER_ID,
      organizationId: ORG_ID,
      branchId: null,
    });

    const hrRes = await supertest(app.getHttpServer())
      .get('/v1/hr/departments')
      .query({ organizationId: ORG_ID })
      .set('Authorization', `Bearer ${readerToken}`);
    expect(hrRes.status).toBe(200);

    const accountingRes = await supertest(app.getHttpServer())
      .get('/v1/accounting/chart-of-accounts')
      .query({ organizationId: ORG_ID })
      .set('Authorization', `Bearer ${readerToken}`);
    expect(accountingRes.status).toBe(200);
  });

  it('reader gets 403 on HR write and Accounting admin endpoints', async () => {
    const readerToken = generateTestToken({
      sub: READER_USER_ID,
      organizationId: ORG_ID,
      branchId: null,
    });

    const hrWriteRes = await supertest(app.getHttpServer())
      .post('/v1/hr/departments')
      .set('Authorization', `Bearer ${readerToken}`)
      .send({
        organizationId: ORG_ID,
        name: 'Dept Read User Blocked',
      });
    expect(hrWriteRes.status).toBe(403);

    const accountingAdminRes = await supertest(app.getHttpServer())
      .post('/v1/accounting/chart-of-accounts')
      .set('Authorization', `Bearer ${readerToken}`)
      .send({
        organizationId: ORG_ID,
        code: '1000',
        name: 'Caja General',
        accountType: 'ASSET',
      });
    expect(accountingAdminRes.status).toBe(403);
  });

  it('admin can write HR and Accounting endpoints', async () => {
    const adminToken = generateTestToken({
      sub: ADMIN_USER_ID,
      organizationId: ORG_ID,
      branchId: null,
    });

    const hrWriteRes = await supertest(app.getHttpServer())
      .post('/v1/hr/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        organizationId: ORG_ID,
        name: 'Dept Admin Created',
      });
    expect(hrWriteRes.status).toBe(201);

    const accountingAdminRes = await supertest(app.getHttpServer())
      .post('/v1/accounting/chart-of-accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        organizationId: ORG_ID,
        code: '1100',
        name: 'Banco Principal',
        accountType: 'ASSET',
      });
    expect(accountingAdminRes.status).toBe(201);
  });
});
