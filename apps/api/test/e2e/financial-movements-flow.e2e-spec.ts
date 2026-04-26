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

const ORG_ID = 'org-e2e-fin-movements';
const USER_ID = 'user-e2e-fin-movements';

const mockUser = { sub: USER_ID, organizationId: ORG_ID, branchId: null };
const guardPassthrough = {
  canActivate: (ctx: import('@nestjs/common').ExecutionContext) => {
    ctx.switchToHttp().getRequest().user = mockUser;
    return true;
  },
};

/**
 * Flujo E2E 1 â€” Ciclo completo de movimientos financieros:
 * Crear cuenta â†’ registrar movimientos â†’ filtrar por fecha â†’ actualizar estado
 */
describe('E2E Flujo 1: Ciclo completo de movimientos financieros', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let http: ReturnType<typeof supertest>;
  let bankAccountId: string;
  const movementIds: string[] = [];

  beforeAll(async () => {
    process.env.DISABLE_AUTH_GUARDS = 'true';
    prisma = new PrismaClient();

    await prisma.organization.upsert({
      where: { id: ORG_ID },
      update: {},
      create: { id: ORG_ID, name: 'Org E2E FinMovements', slug: 'org-e2e-fin-movements' },
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
    await prisma.financialMovement.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.bankAccount.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.$disconnect();
    await app.close();
    delete process.env.DISABLE_AUTH_GUARDS;
  });

  it('Paso 1: crear cuenta bancaria CTA-001 con saldo cero', async () => {
    const res = await http.post('/v1/bank-accounts').send({
      organizationId: ORG_ID,
      name: 'CTA-001 E2E',
      bankName: 'BanBajÃ­o',
      accountNumberMask: '****0010',
      currencyCode: 'MXN',
    });

    expect(res.status).toBe(201);
    bankAccountId = res.body.id as string;
    expect(bankAccountId).toBeDefined();
  });

  it('Paso 2: registrar 3 ingresos y 2 egresos', async () => {
    const now = new Date().toISOString();
    const movements = [
      { movementType: 'INCOME', amount: '10000.00', description: 'Ingreso 1' },
      { movementType: 'INCOME', amount: '5000.00',  description: 'Ingreso 2' },
      { movementType: 'INCOME', amount: '3000.00',  description: 'Ingreso 3' },
      { movementType: 'EXPENSE', amount: '2000.00', description: 'Egreso 1'  },
      { movementType: 'EXPENSE', amount: '1500.00', description: 'Egreso 2'  },
    ];

    for (const m of movements) {
      const res = await http.post('/v1/financial-movements').send({
        organizationId: ORG_ID,
        bankAccountId,
        occurredAt: now,
        currencyCode: 'MXN',
        ...m,
      });
      expect(res.status).toBe(201);
      movementIds.push(res.body.id as string);
    }

    expect(movementIds).toHaveLength(5);
  });

  it('Paso 3: obtener listado filtrado por cuenta â†’ 5 movimientos', async () => {
    const res = await http
      .get('/v1/financial-movements')
      .query({ bankAccountId });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });

  it('Paso 4: filtrar por rango de fechas â†’ aparecen los movimientos registrados', async () => {
    const from = new Date(Date.now() - 60_000).toISOString();
    const to   = new Date(Date.now() + 60_000).toISOString();

    const res = await http
      .get('/v1/financial-movements')
      .query({ bankAccountId, from, to });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });

  it('Paso 5: actualizar estado de un movimiento a CANCELED via PATCH', async () => {
    const movId = movementIds[0];
    const res = await http
      .patch(`/v1/financial-movements/${movId}`)
      .send({ status: 'CANCELED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CANCELED');
  });

  it('Paso 6: obtener movimiento anulado â†’ aparece con status CANCELED', async () => {
    const movId = movementIds[0];
    const res = await http.get(`/v1/financial-movements/${movId}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CANCELED');
  });
});

