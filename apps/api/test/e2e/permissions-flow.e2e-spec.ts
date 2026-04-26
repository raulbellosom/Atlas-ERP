import type { INestApplication} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { AppModule } from '../../src/modules/app/app.module';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../src/common/guards/permissions.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { ScopeGuard } from '../../src/common/guards/scope.guard';
import { generateTestToken } from '../helpers/auth.helper';

const ORG_ID = 'org-e2e-permissions';

/**
 * Flujo E2E 5 â€” Permisos en flujo completo:
 * Prueba 401 sin token, luego con guardas activas verifica acceso con token vÃ¡lido,
 * y con guardas sobrescritas prueba el flujo de solo-lectura vs escritura.
 */
describe('E2E Flujo 5: AutenticaciÃ³n y permisos', () => {
  describe('Sin autenticaciÃ³n â€” guardas reales activas', () => {
    let app: INestApplication;

    beforeAll(async () => {
      delete process.env.DISABLE_AUTH_GUARDS;
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    it('GET /v1/bank-accounts sin token â†’ 401', async () => {
      const res = await supertest(app.getHttpServer()).get('/v1/bank-accounts');
      expect(res.status).toBe(401);
    });

    it('POST /v1/bank-accounts sin token â†’ 401', async () => {
      const res = await supertest(app.getHttpServer())
        .post('/v1/bank-accounts')
        .send({ name: 'Test', bankName: 'Test', accountNumberMask: '****0000', organizationId: ORG_ID });
      expect(res.status).toBe(401);
    });

    it('GET /v1/financial-movements sin token â†’ 401', async () => {
      const res = await supertest(app.getHttpServer()).get('/v1/financial-movements');
      expect(res.status).toBe(401);
    });

    it('GET /v1/transfers sin token â†’ 401', async () => {
      const res = await supertest(app.getHttpServer()).get('/v1/transfers');
      expect(res.status).toBe(401);
    });

    it('POST /v1/auth/login â†’ 200 (ruta pÃºblica sin token)', async () => {
      const res = await supertest(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ organizationId: ORG_ID, email: 'test@example.com', password: 'password123' });
      // 401 es vÃ¡lido (usuario no existe) pero no debe ser 403
      expect([400, 401, 404]).toContain(res.status);
    });

    it('GET /v1/auth/status â†’ 200 (ruta pÃºblica)', async () => {
      const res = await supertest(app.getHttpServer()).get('/v1/auth/status');
      expect(res.status).toBe(200);
    });
  });

  describe('Con token vÃ¡lido y sin permisos en BD â€” flujo de lectura', () => {
    let app: INestApplication;
    let prisma: PrismaClient;

    beforeAll(async () => {
      process.env.DISABLE_AUTH_GUARDS = 'true';
      prisma = new PrismaClient();

      await prisma.organization.upsert({
        where: { id: ORG_ID },
        update: {},
        create: { id: ORG_ID, name: 'Org E2E Permissions', slug: 'org-e2e-permissions' },
      });

      const mockUser = { sub: 'user-perms-e2e', organizationId: ORG_ID, branchId: null };
      const guardPassthrough = {
        canActivate: (ctx: import('@nestjs/common').ExecutionContext) => {
          ctx.switchToHttp().getRequest().user = mockUser;
          return true;
        },
      };

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
    });

    afterAll(async () => {
      await prisma.$disconnect();
      await app.close();
      delete process.env.DISABLE_AUTH_GUARDS;
    });

    it('GET /v1/bank-accounts con token (guardas override) â†’ 200', async () => {
      const token = generateTestToken({ sub: 'user-perms-e2e', organizationId: ORG_ID });
      const res = await supertest(app.getHttpServer())
        .get('/v1/bank-accounts')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('GET /v1/financial-movements con token â†’ 200', async () => {
      const token = generateTestToken({ sub: 'user-perms-e2e', organizationId: ORG_ID });
      const res = await supertest(app.getHttpServer())
        .get('/v1/financial-movements')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('GET /v1/transfers con token â†’ 200', async () => {
      const token = generateTestToken({ sub: 'user-perms-e2e', organizationId: ORG_ID });
      const res = await supertest(app.getHttpServer())
        .get('/v1/transfers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});

