import type { INestApplication} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { AppModule } from '../../src/modules/app/app.module';

const TEST_ORG_ID = 'org-transfers-integration';
const TEST_USER_ID = 'user-transfers-test';

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

describe('Transfers â€” Integration', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let fromAccountId: string;
  let toAccountId: string;
  let createdTransferId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();

    await prisma.organization.upsert({
      where: { id: TEST_ORG_ID },
      update: {},
      create: {
        id: TEST_ORG_ID,
        name: 'Org Transfers Integration',
        slug: 'org-transfers-integration',
      },
    });

    const fromAccount = await prisma.bankAccount.create({
      data: {
        id: 'ba-transfers-from-test',
        organizationId: TEST_ORG_ID,
        name: 'Cuenta Origen Transferencia',
        bankName: 'HSBC',
        accountNumberMask: '****1111',
        currencyCode: 'MXN',
      },
    });
    fromAccountId = fromAccount.id;

    const toAccount = await prisma.bankAccount.create({
      data: {
        id: 'ba-transfers-to-test',
        organizationId: TEST_ORG_ID,
        name: 'Cuenta Destino Transferencia',
        bankName: 'Banamex',
        accountNumberMask: '****2222',
        currencyCode: 'MXN',
      },
    });
    toAccountId = toAccount.id;

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
    await prisma.transfer.deleteMany({ where: { organizationId: TEST_ORG_ID } });
    await prisma.bankAccount.deleteMany({ where: { organizationId: TEST_ORG_ID } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /v1/transfers', () => {
    it('201 â€” crea transferencia entre cuentas con datos vÃ¡lidos', async () => {
      const res = await supertest(app.getHttpServer())
        .post('/v1/transfers')
        .send({
          organizationId: TEST_ORG_ID,
          fromBankAccountId: fromAccountId,
          toBankAccountId: toAccountId,
          amount: '2500.00',
          currencyCode: 'MXN',
          occurredAt: new Date().toISOString(),
          description: 'Transferencia de prueba integraciÃ³n',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.fromBankAccountId).toBe(fromAccountId);
      expect(res.body.toBankAccountId).toBe(toAccountId);
      createdTransferId = res.body.id as string;
    });

    it('400 â€” rechaza body sin fromBankAccountId', async () => {
      const res = await supertest(app.getHttpServer())
        .post('/v1/transfers')
        .send({
          organizationId: TEST_ORG_ID,
          toBankAccountId: toAccountId,
          amount: '1000.00',
          occurredAt: new Date().toISOString(),
        });

      expect(res.status).toBe(400);
    });

    it('400 â€” rechaza body sin amount', async () => {
      const res = await supertest(app.getHttpServer())
        .post('/v1/transfers')
        .send({
          organizationId: TEST_ORG_ID,
          fromBankAccountId: fromAccountId,
          toBankAccountId: toAccountId,
          occurredAt: new Date().toISOString(),
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /v1/transfers', () => {
    it('200 â€” retorna lista de transferencias', async () => {
      const res = await supertest(app.getHttpServer()).get('/v1/transfers');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /v1/transfers/:id', () => {
    it('200 â€” retorna transferencia existente por id', async () => {
      const res = await supertest(app.getHttpServer()).get(
        `/v1/transfers/${createdTransferId}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdTransferId);
    });

    it('retorna null o 404 para id inexistente', async () => {
      const res = await supertest(app.getHttpServer()).get(
        '/v1/transfers/no-existe-este-transfer-id',
      );

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('PATCH /v1/transfers/:id', () => {
    it('200 â€” actualiza descripciÃ³n de transferencia', async () => {
      const res = await supertest(app.getHttpServer())
        .patch(`/v1/transfers/${createdTransferId}`)
        .send({ description: 'DescripciÃ³n de transferencia actualizada' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /v1/transfers/:id', () => {
    it('200 â€” soft delete de transferencia existente', async () => {
      const res = await supertest(app.getHttpServer()).delete(
        `/v1/transfers/${createdTransferId}`,
      );

      expect([200, 204]).toContain(res.status);
    });

    it('404 â€” al intentar eliminar id inexistente', async () => {
      const res = await supertest(app.getHttpServer()).delete(
        '/v1/transfers/no-existe-este-transfer-id',
      );

      expect(res.status).toBe(404);
    });
  });
});

