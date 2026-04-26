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

const ORG_ID = 'org-e2e-reconciliation';
const USER_ID = 'user-e2e-reconciliation';

const mockUser = { sub: USER_ID, organizationId: ORG_ID, branchId: null };
const guardPassthrough = {
  canActivate: (ctx: import('@nestjs/common').ExecutionContext) => {
    ctx.switchToHttp().getRequest().user = mockUser;
    return true;
  },
};

/**
 * Flujo E2E 4 â€” ConciliaciÃ³n bÃ¡sica:
 * Seed sesiÃ³n + movimientos â†’ consultar sesiÃ³n â†’ ejecutar reconcile â†’ cerrar sesiÃ³n
 *
 * Nota: la creaciÃ³n de sesiones de conciliaciÃ³n no tiene endpoint HTTP en esta versiÃ³n.
 * El seed se hace directamente vÃ­a PrismaClient para probar las operaciones disponibles.
 */
describe('E2E Flujo 4: ConciliaciÃ³n bÃ¡sica', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let http: ReturnType<typeof supertest>;
  let bankAccountId: string;
  let sessionId: string;
  let movementId: string;

  beforeAll(async () => {
    process.env.DISABLE_AUTH_GUARDS = 'true';
    prisma = new PrismaClient();

    await prisma.organization.upsert({
      where: { id: ORG_ID },
      update: {},
      create: { id: ORG_ID, name: 'Org E2E Reconciliation', slug: 'org-e2e-reconciliation' },
    });

    const bankAccount = await prisma.bankAccount.create({
      data: {
        id: 'ba-e2e-recon',
        organizationId: ORG_ID,
        name: 'CTA E2E ConciliaciÃ³n',
        bankName: 'Inbursa',
        accountNumberMask: '****9988',
        currencyCode: 'MXN',
      },
    });
    bankAccountId = bankAccount.id;

    const movement = await prisma.financialMovement.create({
      data: {
        organizationId: ORG_ID,
        bankAccountId,
        movementType: 'INCOME',
        amount: 3000,
        currencyCode: 'MXN',
        occurredAt: new Date(),
        description: 'Movimiento para conciliaciÃ³n E2E',
      },
    });
    movementId = movement.id;

    const session = await prisma.reconciliationSession.create({
      data: {
        organizationId: ORG_ID,
        bankAccountId,
        status: 'OPEN',
        items: {
          create: [
            {
              organizationId: ORG_ID,
              financialMovementId: movementId,
              status: 'PENDING',
              expectedAmount: 3000,
              actualAmount: 3000,
            },
          ],
        },
      },
    });
    sessionId = session.id;

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
    await prisma.reconciliationItem.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.reconciliationSession.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.financialMovement.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.bankAccount.deleteMany({ where: { organizationId: ORG_ID } });
    await prisma.$disconnect();
    await app.close();
    delete process.env.DISABLE_AUTH_GUARDS;
  });

  it('Paso 1: listar sesiones â†’ aparece la sesiÃ³n creada', async () => {
    const res = await http
      .get('/v1/reconciliation/sessions')
      .query({ organizationId: ORG_ID });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = (res.body as { id: string }[]).find((s) => s.id === sessionId);
    expect(found).toBeDefined();
  });

  it('Paso 2: obtener detalle de la sesiÃ³n por id', async () => {
    const res = await http.get(`/v1/reconciliation/sessions/${sessionId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(sessionId);
    expect(res.body.status).toBe('OPEN');
  });

  it('Paso 3: obtener Ã­tems de la sesiÃ³n â†’ aparece el movimiento', async () => {
    const res = await http.get(`/v1/reconciliation/sessions/${sessionId}/items`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('Paso 4: ejecutar reconcile en la sesiÃ³n', async () => {
    const res = await http
      .post(`/v1/reconciliation/sessions/${sessionId}/reconcile`)
      .send({ autoResolveDiscrepancies: true });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('sessionId');
  });

  it('Paso 5: cerrar la sesiÃ³n â†’ estado CLOSED', async () => {
    const res = await http
      .post(`/v1/reconciliation/sessions/${sessionId}/close`)
      .send({ notes: 'Cierre E2E prueba' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('CLOSED');
  });
});

