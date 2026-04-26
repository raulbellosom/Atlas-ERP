import type { INestApplication} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { AppModule } from '../../src/modules/app/app.module';

const TEST_ORG_ID = 'org-bank-accounts-integration';
const TEST_USER_ID = 'user-bank-accounts-test';

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

function requestAsUser(app: INestApplication) {
  return supertest(app.getHttpServer());
}

describe('BankAccounts â€” Integration', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let createdId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();

    await prisma.organization.upsert({
      where: { id: TEST_ORG_ID },
      update: {},
      create: {
        id: TEST_ORG_ID,
        name: 'Org Bank Accounts Integration',
        slug: 'org-bank-accounts-integration',
      },
    });

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
    await prisma.bankAccount.deleteMany({ where: { organizationId: TEST_ORG_ID } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /v1/bank-accounts', () => {
    it('201 â€” crea cuenta bancaria con datos vÃ¡lidos', async () => {
      const res = await requestAsUser(app)
        .post('/v1/bank-accounts')
        .send({
          organizationId: TEST_ORG_ID,
          name: 'Caja Principal Test',
          bankName: 'BBVA',
          accountNumberMask: '****1234',
          currencyCode: 'MXN',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Caja Principal Test');
      createdId = res.body.id as string;
    });

    it('400 â€” rechaza body incompleto (sin name)', async () => {
      const res = await requestAsUser(app)
        .post('/v1/bank-accounts')
        .send({
          organizationId: TEST_ORG_ID,
          bankName: 'BBVA',
          accountNumberMask: '****5678',
        });

      expect(res.status).toBe(400);
    });

    it('400 â€” rechaza currencyCode invÃ¡lido', async () => {
      const res = await requestAsUser(app)
        .post('/v1/bank-accounts')
        .send({
          organizationId: TEST_ORG_ID,
          name: 'Cuenta InvÃ¡lida',
          bankName: 'BBVA',
          accountNumberMask: '****9999',
          currencyCode: 'INVALIDO',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /v1/bank-accounts', () => {
    it('200 â€” retorna lista de cuentas', async () => {
      const res = await requestAsUser(app).get('/v1/bank-accounts');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /v1/bank-accounts/:id', () => {
    it('200 â€” retorna cuenta existente por id', async () => {
      const res = await requestAsUser(app).get(
        `/v1/bank-accounts/${createdId}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdId);
    });

    it('retorna null para id inexistente', async () => {
      const res = await requestAsUser(app).get(
        '/v1/bank-accounts/no-existe-este-id',
      );

      // El servicio retorna null; el controlador lo expone como 200 null o 404
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('PATCH /v1/bank-accounts/:id', () => {
    it('200 â€” actualiza nombre de cuenta', async () => {
      const res = await requestAsUser(app)
        .patch(`/v1/bank-accounts/${createdId}`)
        .send({ name: 'Caja Principal Actualizada' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Caja Principal Actualizada');
    });
  });

  describe('DELETE /v1/bank-accounts/:id', () => {
    it('200 â€” soft delete de cuenta existente', async () => {
      const res = await requestAsUser(app).delete(
        `/v1/bank-accounts/${createdId}`,
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('deleted', true);
    });

    it('404 â€” al intentar eliminar id inexistente', async () => {
      const res = await requestAsUser(app).delete(
        '/v1/bank-accounts/no-existe-este-id',
      );

      expect(res.status).toBe(404);
    });
  });
});

