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

const ORG_ID = 'org-e2e-transfers';
const USER_ID = 'user-e2e-transfers';

const mockUser = { sub: USER_ID, organizationId: ORG_ID, branchId: null };
const guardPassthrough = {
  canActivate: (ctx: import('@nestjs/common').ExecutionContext) => {
    ctx.switchToHttp().getRequest().user = mockUser;
    return true;
  },
};

/**
 * Flujo E2E 2 â€” Ciclo completo de transferencias entre cuentas:
 * Crear dos cuentas â†’ crear transferencia â†’ verificar en lista â†’ filtrar por cuenta
 */
describe('E2E Flujo 2: Ciclo completo de transferencias entre cuentas', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let http: ReturnType<typeof supertest>;
  let ctaAId: string;
  let ctaBId: string;
  let transferId: string;

  beforeAll(async () => {
    process.env.DISABLE_AUTH_GUARDS = 'true';
    prisma = new PrismaClient();

    await prisma.organization.upsert({
      where: { id: ORG_ID },
      update: {},
      create: { id: ORG_ID, name: 'Org E2E Transfers', slug: 'org-e2e-transfers' },
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
    await prisma.transfer.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.bankAccount.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.$disconnect();
    await app.close();
    delete process.env.DISABLE_AUTH_GUARDS;
  });

  it('Paso 1: crear cuenta CTA-A (origen)', async () => {
    const res = await http.post('/v1/bank-accounts').send({
      organizationId: ORG_ID,
      name: 'CTA-A Origen E2E',
      bankName: 'Scotiabank',
      accountNumberMask: '****1001',
      currencyCode: 'MXN',
    });

    expect(res.status).toBe(201);
    ctaAId = res.body.id as string;
  });

  it('Paso 2: crear cuenta CTA-B (destino)', async () => {
    const res = await http.post('/v1/bank-accounts').send({
      organizationId: ORG_ID,
      name: 'CTA-B Destino E2E',
      bankName: 'Banorte',
      accountNumberMask: '****2002',
      currencyCode: 'MXN',
    });

    expect(res.status).toBe(201);
    ctaBId = res.body.id as string;
  });

  it('Paso 3: crear transferencia de CTA-A a CTA-B', async () => {
    const res = await http.post('/v1/transfers').send({
      organizationId: ORG_ID,
      fromBankAccountId: ctaAId,
      toBankAccountId: ctaBId,
      amount: '8000.00',
      currencyCode: 'MXN',
      occurredAt: new Date().toISOString(),
      description: 'Transferencia E2E entre cuentas',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.fromBankAccountId).toBe(ctaAId);
    expect(res.body.toBankAccountId).toBe(ctaBId);
    transferId = res.body.id as string;
  });

  it('Paso 4: verificar transferencia en listado general', async () => {
    const res = await http.get('/v1/transfers');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = (res.body as { id: string }[]).find((t) => t.id === transferId);
    expect(found).toBeDefined();
  });

  it('Paso 5: filtrar transferencias por cuenta origen â†’ aparece la transferencia', async () => {
    const res = await http
      .get('/v1/transfers')
      .query({ fromBankAccountId: ctaAId });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = (res.body as { id: string }[]).find((t) => t.id === transferId);
    expect(found).toBeDefined();
  });

  it('Paso 6: obtener detalle de la transferencia por id', async () => {
    const res = await http.get(`/v1/transfers/${transferId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(transferId);
    expect(res.body.amount).toBeDefined();
  });

  it('Paso 7: soft delete de la transferencia', async () => {
    const res = await http.delete(`/v1/transfers/${transferId}`);

    expect([200, 204]).toContain(res.status);
  });

  it('Paso 8: transferencia eliminada â†’ ya no aparece en listado activo', async () => {
    const res = await http
      .get('/v1/transfers')
      .query({ fromBankAccountId: ctaAId });

    expect(res.status).toBe(200);
    const found = (res.body as { id: string }[]).find((t) => t.id === transferId);
    expect(found).toBeUndefined();
  });
});

