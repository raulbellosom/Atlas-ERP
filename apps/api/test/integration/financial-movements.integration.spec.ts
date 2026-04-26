import type { INestApplication} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { AppModule } from '../../src/modules/app/app.module';

const TEST_ORG_ID = 'org-fin-movements-integration';
const TEST_USER_ID = 'user-fin-movements-test';

const mockUser = {
  sub: TEST_USER_ID,
  organizationId: TEST_ORG_ID,
  branchId: null,
};

const guardPassthrough = {
  canActivate: (ctx: import('@nestjs/common').ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    req.user = mockUser;
    return true;
  },
};

describe('FinancialMovements â€” Integration', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let bankAccountId: string;
  let createdMovementId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();

    await prisma.organization.upsert({
      where: { id: TEST_ORG_ID },
      update: {},
      create: {
        id: TEST_ORG_ID,
        name: 'Org FinMovements Integration',
        slug: 'org-fin-movements-integration',
      },
    });

    const bankAccount = await prisma.bankAccount.create({
      data: {
        id: 'ba-fin-movements-test',
        organizationId: TEST_ORG_ID,
        name: 'Cuenta Movimientos Test',
        bankName: 'Santander',
        accountNumberMask: '****4321',
        currencyCode: 'MXN',
      },
    });
    bankAccountId = bankAccount.id;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(APP_GUARD)
      .useValue(guardPassthrough)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await prisma.financialMovement.deleteMany({ where: { organizationId: TEST_ORG_ID } });
    await prisma.bankAccount.deleteMany({ where: { organizationId: TEST_ORG_ID } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /v1/financial-movements', () => {
    it('201 â€” registra movimiento de ingreso con datos vÃ¡lidos', async () => {
      const res = await supertest(app.getHttpServer())
        .post('/v1/financial-movements')
        .send({
          organizationId: TEST_ORG_ID,
          bankAccountId,
          movementType: 'INCOME',
          amount: '5000.00',
          currencyCode: 'MXN',
          occurredAt: new Date().toISOString(),
          description: 'Ingreso de prueba',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.movementType).toBe('INCOME');
      createdMovementId = res.body.id as string;
    });

    it('400 â€” rechaza body sin movementType', async () => {
      const res = await supertest(app.getHttpServer())
        .post('/v1/financial-movements')
        .send({
          organizationId: TEST_ORG_ID,
          bankAccountId,
          amount: '1000.00',
          occurredAt: new Date().toISOString(),
        });

      expect(res.status).toBe(400);
    });

    it('400 â€” rechaza movementType invÃ¡lido', async () => {
      const res = await supertest(app.getHttpServer())
        .post('/v1/financial-movements')
        .send({
          organizationId: TEST_ORG_ID,
          bankAccountId,
          movementType: 'INVALIDO',
          amount: '1000.00',
          occurredAt: new Date().toISOString(),
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /v1/financial-movements', () => {
    it('200 â€” retorna lista de movimientos', async () => {
      const res = await supertest(app.getHttpServer()).get('/v1/financial-movements');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /v1/financial-movements/:id', () => {
    it('200 â€” retorna movimiento existente por id', async () => {
      const res = await supertest(app.getHttpServer()).get(
        `/v1/financial-movements/${createdMovementId}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdMovementId);
    });
  });

  describe('PATCH /v1/financial-movements/:id', () => {
    it('200 â€” actualiza descripciÃ³n del movimiento', async () => {
      const res = await supertest(app.getHttpServer())
        .patch(`/v1/financial-movements/${createdMovementId}`)
        .send({ description: 'DescripciÃ³n actualizada' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /v1/financial-movements/:id', () => {
    it('200 â€” soft delete de movimiento existente', async () => {
      const res = await supertest(app.getHttpServer()).delete(
        `/v1/financial-movements/${createdMovementId}`,
      );

      expect([200, 204]).toContain(res.status);
    });
  });
});

