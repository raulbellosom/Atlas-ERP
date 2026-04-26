import type { INestApplication} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../src/common/guards/permissions.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { ScopeGuard } from '../../src/common/guards/scope.guard';
import { AppModule } from '../../src/modules/app/app.module';

const ORG_ID = 'org-e2e-recv-pay';
const USER_ID = 'user-e2e-recv-pay';

const mockUser = { sub: USER_ID, organizationId: ORG_ID, branchId: null };
const guardPassthrough = {
  canActivate: (ctx: import('@nestjs/common').ExecutionContext) => {
    ctx.switchToHttp().getRequest().user = mockUser;
    return true;
  },
};

/**
 * Flujo E2E 3 â€” Cuentas por cobrar y por pagar:
 * Crear CxC â†’ consultar â†’ actualizar estado â†’ crear CxP â†’ pagar parcialmente
 */
describe('E2E Flujo 3: Cuentas por cobrar y por pagar', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let http: ReturnType<typeof supertest>;
  let receivableId: string;
  let payableId: string;

  beforeAll(async () => {
    process.env.DISABLE_AUTH_GUARDS = 'true';
    prisma = new PrismaClient();

    await prisma.organization.upsert({
      where: { id: ORG_ID },
      update: {},
      create: { id: ORG_ID, name: 'Org E2E RecvPay', slug: 'org-e2e-recv-pay' },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard).useValue(guardPassthrough)
      .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .overrideGuard(ScopeGuard).useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = supertest(app.getHttpServer());
  });

  afterAll(async () => {
    await prisma.receivableLite.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.payableLite.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.$disconnect();
    await app.close();
    delete process.env.DISABLE_AUTH_GUARDS;
  });

  describe('Cuentas por cobrar (CxC)', () => {
    it('Paso 1: crear CxC con estado OPEN y fecha de vencimiento', async () => {
      const dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const res = await http.post('/v1/receivables-lite').send({
        organizationId: ORG_ID,
        amount: '15000.00',
        currencyCode: 'MXN',
        status: 'OPEN',
        dueAt,
        description: 'CxC E2E â€” Factura cliente test',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      receivableId = res.body.id as string;
    });

    it('Paso 2: consultar CxC activas â†’ aparece la creada', async () => {
      const res = await http
        .get('/v1/receivables-lite')
        .query({ organizationId: ORG_ID, status: 'OPEN' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = (res.body as { id: string }[]).find((r) => r.id === receivableId);
      expect(found).toBeDefined();
    });

    it('Paso 3: actualizar CxC a PAID', async () => {
      const res = await http
        .patch(`/v1/receivables-lite/${receivableId}`)
        .send({
          status: 'PAID',
          amountPaid: '15000.00',
          paidAt: new Date().toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PAID');
    });

    it('Paso 4: consultar CxC OPEN â†’ ya no aparece la pagada', async () => {
      const res = await http
        .get('/v1/receivables-lite')
        .query({ organizationId: ORG_ID, status: 'OPEN' });

      expect(res.status).toBe(200);
      const found = (res.body as { id: string }[]).find((r) => r.id === receivableId);
      expect(found).toBeUndefined();
    });
  });

  describe('Cuentas por pagar (CxP)', () => {
    it('Paso 5: crear CxP con estado OPEN', async () => {
      const dueAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
      const res = await http.post('/v1/payables-lite').send({
        organizationId: ORG_ID,
        amount: '8500.00',
        currencyCode: 'MXN',
        status: 'OPEN',
        dueAt,
        description: 'CxP E2E â€” Proveedor test',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      payableId = res.body.id as string;
    });

    it('Paso 6: consultar CxP â†’ aparece en la lista', async () => {
      const res = await http
        .get('/v1/payables-lite')
        .query({ organizationId: ORG_ID });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = (res.body as { id: string }[]).find((p) => p.id === payableId);
      expect(found).toBeDefined();
    });

    it('Paso 7: pago parcial de CxP â†’ actualizar amountPaid', async () => {
      const res = await http
        .patch(`/v1/payables-lite/${payableId}`)
        .send({ amountPaid: '4000.00' });

      expect(res.status).toBe(200);
    });
  });
});

