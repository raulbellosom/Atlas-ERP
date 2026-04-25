# AtlasERP Fase 17â€“22 Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute all remaining tasks from Fase 17 (Quality & Testing) through
Fase 22 (Modular Expansion Prep), converting existing task documentation into
working code, configuration, and documentation â€” closing AtlasERP v1.

**Architecture:** NestJS v11 API + React 19 / Vite 6 web + Tauri 2.0 desktop,
pnpm monorepo with Turbo. Testing stack: Jest (API) + Vitest (web) + Playwright
(E2E). CI/CD via GitHub Actions.

**Tech Stack:** TypeScript 5.8, NestJS 11, Prisma 6, PostgreSQL 16 (Docker),
Redis 7, MinIO, Vitest 2, Jest 29, Supertest, React Testing Library, Playwright.

---

## Environment Startup (run before any task)

```bash
# 1. Start Docker services (PostgreSQL 16, Redis 7, MinIO)
pnpm infra:up

# 2. Start API dev server (separate terminal)
pnpm --filter @atlaserp/api dev

# 3. Start web dev server (separate terminal)
pnpm --filter @atlaserp/web dev

# Validate stack is up:
pnpm --filter @atlaserp/api run typecheck   # should be 0 errors
pnpm --filter @atlaserp/web run typecheck   # should be 0 errors
pnpm --filter @atlaserp/web run build       # should succeed
```

---

## Token-Efficient Execution Strategy

- **Fase 17** (T-1700â€“T-1723): Fully detailed â€” this is the immediate work.
- **Fase 18â€“22**: Summary-level. Re-read the task files for each Fase when it
  begins; they contain full spec.
- Each task ends with: update task file status â†’ update block status â†’
  update master catalog.
- Standard close commands (run after every task):

```bash
# Replace T-XXXX with the task ID and N with block number
# 1. Update task file: Estado: closed, Fecha de actualizaciÃ³n: 2026-04-18
# 2. Update docs/07-dev-workflow/task-block-NNN-status.md
# 3. Update business-platform-master-task-catalog.md (mark T-XXXX as CERRADA)
```

---

## FASE 17 â€” Quality & Testing (T-1700 to T-1723)

### Task T-1700: Define Testing Strategy Document

**Files:**

- Create: `docs/07-dev-workflow/testing-strategy.md`
- Update: `docs/07-dev-workflow/task-block-117-status.md`
- Update: `business-platform-master-task-catalog.md`
- Update:
  `docs/07-dev-workflow/tasks/fase-17-bloque-01/T-1700-estrategia-testing-por-capas.md`

- [ ] **Step 1: Create testing-strategy.md**

```markdown
# AtlasERP â€” Testing Strategy v1

## Capas de testing

| Capa                       | Ãmbito                                             | Herramienta               | CuÃ¡ndo corre    |
| -------------------------- | -------------------------------------------------- | ------------------------- | ---------------- |
| 1 â€” Unitarios backend    | `apps/api` servicios y lÃ³gica de negocio aislados | Jest + mocks              | Cada PR          |
| 2 â€” IntegraciÃ³n backend | Endpoints CRUD con PostgreSQL real de test         | Jest + Supertest          | Merge a main     |
| 3 â€” E2E backend          | Flujos completos de negocio encadenados            | Jest + Supertest          | Pipeline staging |
| 4 â€” Frontend componentes | Componentes React aislados                         | Vitest + RTL              | Cada PR          |
| 5 â€” E2E web              | Flujos de usuario en navegador                     | Playwright                | Pipeline staging |
| 6 â€” Desktop crÃ­ticos    | Flujos offline y sync en Tauri                     | Playwright + Tauri driver | Pipeline staging |
| 7 â€” Sync Core            | Cola local, push/pull, resoluciÃ³n de conflictos   | Jest / tsx --test         | Cada PR          |

## Cobertura mÃ­nima aceptable

- Backend unitarios: â‰¥ 70% lÃ­neas en mÃ³dulos Financial Operations Core.
- Backend integraciÃ³n: todos endpoints CRUD â€” caso feliz + caso error.
- E2E backend: 1 flujo completo por entidad (crear â†’ listar â†’ editar â†’
  eliminar).
- Frontend componentes: componentes crÃ­ticos del design system (Button, Input,
  Badge, DataTable).
- E2E web: flujo movimiento, transferencia y conciliaciÃ³n completos.

## Convenciones de nomenclatura

- Unitarios: `*.spec.ts` junto al archivo fuente
  (`src/modules/bank-accounts/bank-accounts.service.spec.ts`).
- IntegraciÃ³n: `*.integration.spec.ts` en `apps/api/test/integration/`.
- E2E backend: `*.e2e-spec.ts` en `apps/api/test/e2e/`.
- Frontend: `*.test.tsx` junto al componente.
- Playwright E2E: `e2e/*.spec.ts` en `apps/web/`.

## PolÃ­tica de datos de prueba

- Unitarios: solo mocks y factories en memoria â€” sin acceso a BD.
- IntegraciÃ³n: `DATABASE_TEST_URL` â†’ base de datos `atlaserp_test` separada,
  seeds de prueba antes de cada suite.
- E2E: misma BD de test con datos demo realistas.

## PolÃ­tica de ejecuciÃ³n

- Unitarios + lint + typecheck â†’ cada PR (< 30s).
- IntegraciÃ³n â†’ merge a `main` (< 2min).
- E2E backend, E2E web, smoke tests â†’ pipeline de staging.

## Mapeo de tasks de Fase 17

| Task   | DescripciÃ³n                                                |
| ------ | ----------------------------------------------------------- |
| T-1700 | Este documento                                              |
| T-1701 | Configurar Jest unitarios backend + factories + mocks       |
| T-1702 | Configurar Jest integraciÃ³n backend + Supertest            |
| T-1703 | Configurar Jest E2E backend â€” 5 flujos de negocio         |
| T-1704 | Configurar Vitest + RTL frontend â€” design system + FinOps |
| T-1705 | Tests UI avanzados (formularios complejos FinOps)           |
| T-1706 | Tests desktop crÃ­ticos (flujos offline Tauri)              |
| T-1707 | Tests Sync Core (cola, push, pull, conflictos)              |
| T-1708 | Datos de prueba realistas (seed volumen)                    |
| T-1709 | Matriz de escenarios de negocio v1                          |
| T-1710 | Matriz de escenarios offline                                |
| T-1711 | Matriz de escenarios de conflicto                           |
| T-1712 | Matriz de escenarios de permisos                            |
| T-1713 | Matriz de regresiÃ³n v1                                     |
| T-1714 | Smoke tests de apps (local)                                 |
| T-1715 | Smoke tests post-deploy                                     |
| T-1716 | Pruebas de restauraciÃ³n de backups                         |
| T-1717 | Pruebas de persistencia local SQLite                        |
| T-1718 | Pruebas de fallo parcial de sync                            |
| T-1719 | Pruebas de idempotencia en sync                             |
| T-1720 | Pruebas de performance base                                 |
| T-1721 | Pruebas de carga bÃ¡sicas del backend                       |
| T-1722 | CorrecciÃ³n de defectos encontrados                         |
| T-1723 | AprobaciÃ³n del baseline de calidad v1                      |

## Herramientas aprobadas

- Jest 29 + ts-jest (backend unitarios/integraciÃ³n/E2E)
- @nestjs/testing (ya instalado en `apps/api`)
- Supertest (integraciÃ³n/E2E backend)
- Vitest 2 (ya instalado en `apps/web`)
- React Testing Library + jest-dom + user-event
- Playwright (E2E web y desktop)
```

- [ ] **Step 2: Close T-1700** â€” update task file estado â†’ `closed`, update
      block-117, update catalog.

---

### Task T-1701: Configure Backend Unit Tests

**Files:**

- Create: `apps/api/jest.config.unit.js`
- Create: `apps/api/src/test-utils/factories/bank-account.factory.ts`
- Create: `apps/api/src/test-utils/factories/financial-movement.factory.ts`
- Create: `apps/api/src/test-utils/factories/transfer.factory.ts`
- Create: `apps/api/src/test-utils/mocks/prisma.mock.ts`
- Create: `apps/api/src/test-utils/mocks/audit.mock.ts`
- Create: `apps/api/src/test-utils/mocks/auth.mock.ts`
- Create: `apps/api/src/modules/bank-accounts/bank-accounts.service.spec.ts`
- Create:
  `apps/api/src/modules/financial-movements/financial-movements.service.spec.ts`
- Create: `apps/api/src/modules/transfers/transfers.service.spec.ts`
- Create:
  `apps/api/src/modules/balance-snapshots/balance-snapshots.service.spec.ts`
- Modify: `apps/api/package.json` â€” add `test:unit` and `test:unit:coverage`
  scripts

- [ ] **Step 1: Install Jest + ts-jest (not in devDependencies yet)**

```bash
pnpm --filter @atlaserp/api add -D jest ts-jest @types/jest supertest @types/supertest
```

- [ ] **Step 2: Create jest.config.unit.js**

```javascript
// apps/api/jest.config.unit.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '\\.spec\\.ts$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coverageDirectory: 'coverage/unit',
  collectCoverageFrom: [
    'src/**/*.service.ts',
    'src/**/*.guard.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
  ],
  roots: ['<rootDir>/src'],
};
```

- [ ] **Step 3: Add scripts to apps/api/package.json**

Add to `"scripts"`:

```json
"test:unit": "jest --config jest.config.unit.js --passWithNoTests",
"test:unit:coverage": "jest --config jest.config.unit.js --coverage --passWithNoTests"
```

- [ ] **Step 4: Create test-utils factories**

`apps/api/src/test-utils/factories/bank-account.factory.ts`:

```typescript
import { BankAccount } from '@prisma/client';

let seq = 0;
export function bankAccountFactory(
  overrides: Partial<BankAccount> = {},
): BankAccount {
  seq++;
  return {
    id: `ba-${seq}`,
    name: `Cuenta ${seq}`,
    currency: 'USD',
    type: 'CHECKING',
    balance: 0,
    organizationId: 'org-1',
    isActive: true,
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  } as BankAccount;
}
```

`apps/api/src/test-utils/factories/financial-movement.factory.ts`:

```typescript
import { FinancialMovement } from '@prisma/client';

let seq = 0;
export function financialMovementFactory(
  overrides: Partial<FinancialMovement> = {},
): FinancialMovement {
  seq++;
  return {
    id: `fm-${seq}`,
    bankAccountId: 'ba-1',
    type: 'CREDIT',
    amount: 1000,
    currency: 'USD',
    description: `Movimiento ${seq}`,
    status: 'ACTIVE',
    movementDate: new Date('2026-01-15'),
    organizationId: 'org-1',
    createdBy: 'user-1',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    deletedAt: null,
    ...overrides,
  } as FinancialMovement;
}
```

`apps/api/src/test-utils/factories/transfer.factory.ts`:

```typescript
import { Transfer } from '@prisma/client';

let seq = 0;
export function transferFactory(overrides: Partial<Transfer> = {}): Transfer {
  seq++;
  return {
    id: `tr-${seq}`,
    fromAccountId: 'ba-1',
    toAccountId: 'ba-2',
    amount: 500,
    currency: 'USD',
    status: 'PENDING',
    description: `Transferencia ${seq}`,
    organizationId: 'org-1',
    createdBy: 'user-1',
    approvedBy: null,
    approvedAt: null,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    ...overrides,
  } as Transfer;
}
```

- [ ] **Step 5: Create mocks**

`apps/api/src/test-utils/mocks/prisma.mock.ts`:

```typescript
export const prismaMock = {
  bankAccount: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  financialMovement: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  transfer: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  balanceSnapshot: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  $transaction: jest.fn((fn: any) => fn(prismaMock)),
};
```

`apps/api/src/test-utils/mocks/audit.mock.ts`:

```typescript
export const auditMock = {
  log: jest.fn().mockResolvedValue(undefined),
};
```

`apps/api/src/test-utils/mocks/auth.mock.ts`:

```typescript
export const mockUser = {
  id: 'user-1',
  email: 'admin@test.com',
  role: 'ADMIN',
  organizationId: 'org-1',
};

export const mockRequest = { user: mockUser };
```

- [ ] **Step 6: Create bank-accounts.service.spec.ts**

```typescript
// apps/api/src/modules/bank-accounts/bank-accounts.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { bankAccountFactory } from '../../test-utils/factories/bank-account.factory';

describe('BankAccountsService', () => {
  let service: BankAccountsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<BankAccountsService>(BankAccountsService);
  });

  describe('findOne', () => {
    it('returns account when found', async () => {
      const account = bankAccountFactory();
      prismaMock.bankAccount.findUnique.mockResolvedValue(account);
      const result = await service.findOne(account.id);
      expect(result).toEqual(account);
    });

    it('throws NotFoundException when not found', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('returns list of accounts', async () => {
      const accounts = [bankAccountFactory(), bankAccountFactory()];
      prismaMock.bankAccount.findMany.mockResolvedValue(accounts);
      prismaMock.bankAccount.count.mockResolvedValue(2);
      const result = await service.findAll({ organizationId: 'org-1' });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('creates account with valid data', async () => {
      const dto = { name: 'Caja Principal', currency: 'USD', type: 'CHECKING' };
      prismaMock.bankAccount.findFirst.mockResolvedValue(null);
      prismaMock.bankAccount.create.mockResolvedValue(bankAccountFactory(dto));
      const result = await service.create({
        ...dto,
        organizationId: 'org-1',
        createdBy: 'user-1',
      } as any);
      expect(result.name).toBe('Caja Principal');
    });

    it('throws ConflictException if name already exists', async () => {
      prismaMock.bankAccount.findFirst.mockResolvedValue(bankAccountFactory());
      await expect(
        service.create({
          name: 'Duplicado',
          currency: 'USD',
          type: 'CHECKING',
          organizationId: 'org-1',
          createdBy: 'user-1',
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt instead of removing the record', async () => {
      const account = bankAccountFactory();
      prismaMock.bankAccount.findUnique.mockResolvedValue(account);
      prismaMock.bankAccount.update.mockResolvedValue({
        ...account,
        deletedAt: new Date(),
      });
      const result = await service.softDelete(account.id);
      expect(result.deletedAt).not.toBeNull();
      expect(prismaMock.bankAccount.delete).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 7: Create financial-movements.service.spec.ts**

```typescript
// apps/api/src/modules/financial-movements/financial-movements.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FinancialMovementsService } from './financial-movements.service';
import { PrismaService } from '../../prisma/prisma.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { financialMovementFactory } from '../../test-utils/factories/financial-movement.factory';
import { bankAccountFactory } from '../../test-utils/factories/bank-account.factory';

describe('FinancialMovementsService', () => {
  let service: FinancialMovementsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialMovementsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<FinancialMovementsService>(FinancialMovementsService);
  });

  describe('create', () => {
    it('creates a movement and updates account balance', async () => {
      const account = bankAccountFactory({ balance: 0 });
      const movement = financialMovementFactory({
        type: 'CREDIT',
        amount: 500,
      });
      prismaMock.bankAccount.findUnique.mockResolvedValue(account);
      prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock));
      prismaMock.financialMovement.create.mockResolvedValue(movement);
      prismaMock.bankAccount.update.mockResolvedValue({
        ...account,
        balance: 500,
      });
      const result = await service.create({
        bankAccountId: 'ba-1',
        type: 'CREDIT',
        amount: 500,
        currency: 'USD',
        movementDate: new Date(),
        organizationId: 'org-1',
        createdBy: 'user-1',
      } as any);
      expect(result.amount).toBe(500);
    });

    it('throws NotFoundException when account does not exist', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue(null);
      await expect(
        service.create({
          bankAccountId: 'missing',
          type: 'CREDIT',
          amount: 100,
          currency: 'USD',
          movementDate: new Date(),
          organizationId: 'org-1',
          createdBy: 'user-1',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('void', () => {
    it('marks movement as VOID and recalculates balance', async () => {
      const movement = financialMovementFactory({
        status: 'ACTIVE',
        type: 'CREDIT',
        amount: 500,
      });
      const account = bankAccountFactory({ balance: 500 });
      prismaMock.financialMovement.findUnique.mockResolvedValue(movement);
      prismaMock.bankAccount.findUnique.mockResolvedValue(account);
      prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock));
      prismaMock.financialMovement.update.mockResolvedValue({
        ...movement,
        status: 'VOID',
      });
      prismaMock.bankAccount.update.mockResolvedValue({
        ...account,
        balance: 0,
      });
      const result = await service.void(movement.id);
      expect(result.status).toBe('VOID');
    });
  });

  describe('findByFilters', () => {
    it('returns filtered list of movements', async () => {
      const movements = [
        financialMovementFactory(),
        financialMovementFactory(),
      ];
      prismaMock.financialMovement.findMany.mockResolvedValue(movements);
      prismaMock.financialMovement.count.mockResolvedValue(2);
      const result = await service.findByFilters({
        organizationId: 'org-1',
        bankAccountId: 'ba-1',
      } as any);
      expect(result.data).toHaveLength(2);
    });
  });
});
```

- [ ] **Step 8: Create transfers.service.spec.ts and
      balance-snapshots.service.spec.ts**

`apps/api/src/modules/transfers/transfers.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { transferFactory } from '../../test-utils/factories/transfer.factory';
import { bankAccountFactory } from '../../test-utils/factories/bank-account.factory';

describe('TransfersService', () => {
  let service: TransfersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<TransfersService>(TransfersService);
  });

  describe('create', () => {
    it('creates transfer in PENDING state', async () => {
      const fromAccount = bankAccountFactory({ id: 'ba-1', balance: 1000 });
      const toAccount = bankAccountFactory({ id: 'ba-2', balance: 0 });
      prismaMock.bankAccount.findUnique
        .mockResolvedValueOnce(fromAccount)
        .mockResolvedValueOnce(toAccount);
      prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock));
      prismaMock.transfer.create.mockResolvedValue(
        transferFactory({ status: 'PENDING' }),
      );
      const result = await service.create({
        fromAccountId: 'ba-1',
        toAccountId: 'ba-2',
        amount: 500,
        currency: 'USD',
        organizationId: 'org-1',
        createdBy: 'user-1',
      } as any);
      expect(result.status).toBe('PENDING');
    });
  });

  describe('approve', () => {
    it('changes status to APPROVED', async () => {
      const transfer = transferFactory({ status: 'PENDING' });
      prismaMock.transfer.findUnique.mockResolvedValue(transfer);
      prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock));
      prismaMock.transfer.update.mockResolvedValue({
        ...transfer,
        status: 'APPROVED',
      });
      const result = await service.approve(transfer.id, 'user-1');
      expect(result.status).toBe('APPROVED');
    });

    it('throws ConflictException if transfer is already approved', async () => {
      prismaMock.transfer.findUnique.mockResolvedValue(
        transferFactory({ status: 'APPROVED' }),
      );
      await expect(service.approve('tr-1', 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('reject', () => {
    it('changes status to REJECTED without creating movements', async () => {
      const transfer = transferFactory({ status: 'PENDING' });
      prismaMock.transfer.findUnique.mockResolvedValue(transfer);
      prismaMock.transfer.update.mockResolvedValue({
        ...transfer,
        status: 'REJECTED',
      });
      const result = await service.reject(transfer.id, 'user-1');
      expect(result.status).toBe('REJECTED');
      expect(prismaMock.financialMovement.create).not.toHaveBeenCalled();
    });
  });
});
```

`apps/api/src/modules/balance-snapshots/balance-snapshots.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { BalanceSnapshotsService } from './balance-snapshots.service';
import { PrismaService } from '../../prisma/prisma.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { bankAccountFactory } from '../../test-utils/factories/bank-account.factory';

describe('BalanceSnapshotsService', () => {
  let service: BalanceSnapshotsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceSnapshotsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<BalanceSnapshotsService>(BalanceSnapshotsService);
  });

  describe('calculateBalance', () => {
    it('returns correct balance for date range', async () => {
      prismaMock.bankAccount.findUnique.mockResolvedValue(
        bankAccountFactory({ balance: 1500 }),
      );
      const result = await service.calculateBalance(
        'ba-1',
        new Date('2026-01-01'),
        new Date('2026-01-31'),
      );
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});
```

- [ ] **Step 9: Run unit tests**

```bash
pnpm --filter @atlaserp/api run test:unit
# Expected: all pass (or passWithNoTests if service signatures differ)
pnpm --filter @atlaserp/api run typecheck
# Expected: 0 errors
```

- [ ] **Step 10: Close T-1701** â€” update task file, block-117 status, master
      catalog.

---

### Task T-1702: Configure Backend Integration Tests

**Files:**

- Create: `apps/api/jest.config.integration.js`
- Create: `apps/api/.env.test`
- Create: `apps/api/test/setup/global-setup.ts`
- Create: `apps/api/test/setup/global-teardown.ts`
- Create: `apps/api/test/helpers/app.helper.ts`
- Create: `apps/api/test/helpers/auth.helper.ts`
- Create: `apps/api/test/helpers/db-cleanup.helper.ts`
- Create: `apps/api/test/integration/bank-accounts.integration.spec.ts`
- Create: `apps/api/test/integration/financial-movements.integration.spec.ts`
- Create: `apps/api/test/integration/transfers.integration.spec.ts`
- Modify: `apps/api/package.json` â€” add `test:integration` script

- [ ] **Step 1: Create jest.config.integration.js**

```javascript
// apps/api/jest.config.integration.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '\\.integration\\.spec\\.ts$',
  testTimeout: 30000,
  globalSetup: '<rootDir>/test/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/setup/global-teardown.ts',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/test/integration'],
};
```

- [ ] **Step 2: Create .env.test**

```bash
# apps/api/.env.test
DATABASE_TEST_URL="postgresql://postgres:postgres@localhost:5432/atlaserp_test"
JWT_SECRET="test-secret-do-not-use-in-production"
```

- [ ] **Step 3: Create global-setup.ts**

```typescript
// apps/api/test/setup/global-setup.ts
import { execSync } from 'child_process';

export default async function globalSetup() {
  process.env.DATABASE_URL =
    process.env.DATABASE_TEST_URL ??
    'postgresql://postgres:postgres@localhost:5432/atlaserp_test';
  execSync(
    'pnpm --filter @atlaserp/api exec prisma migrate deploy --schema ../../prisma/schema.prisma',
    {
      env: { ...process.env },
      stdio: 'inherit',
    },
  );
}
```

- [ ] **Step 4: Create global-teardown.ts**

```typescript
// apps/api/test/setup/global-teardown.ts
export default async function globalTeardown() {
  // Connection cleanup handled by NestJS app in afterAll of each spec
}
```

- [ ] **Step 5: Create app.helper.ts**

```typescript
// apps/api/test/helpers/app.helper.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as supertest from 'supertest';

let app: INestApplication;

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

export function request(app: INestApplication) {
  return supertest(app.getHttpServer());
}
```

- [ ] **Step 6: Create auth.helper.ts**

```typescript
// apps/api/test/helpers/auth.helper.ts
import * as jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-secret-do-not-use-in-production';

export function generateToken(payload: {
  userId: string;
  role: string;
  organizationId: string;
}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export const adminToken = () =>
  generateToken({
    userId: 'test-admin',
    role: 'ADMIN',
    organizationId: 'org-test',
  });
export const operatorToken = () =>
  generateToken({
    userId: 'test-operator',
    role: 'OPERATOR',
    organizationId: 'org-test',
  });
export const viewerToken = () =>
  generateToken({
    userId: 'test-viewer',
    role: 'VIEWER',
    organizationId: 'org-test',
  });
```

- [ ] **Step 7: Create db-cleanup.helper.ts**

```typescript
// apps/api/test/helpers/db-cleanup.helper.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
});

export async function cleanDatabase() {
  // Delete in FK-safe order (children first)
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.reconciliationItem.deleteMany(),
    prisma.reconciliationSession.deleteMany(),
    prisma.financialMovement.deleteMany(),
    prisma.transfer.deleteMany(),
    prisma.balanceSnapshot.deleteMany(),
    prisma.bankAccount.deleteMany(),
  ]);
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
```

- [ ] **Step 8: Create bank-accounts.integration.spec.ts**

```typescript
// apps/api/test/integration/bank-accounts.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import { createTestApp, request } from '../helpers/app.helper';
import { adminToken, viewerToken } from '../helpers/auth.helper';
import {
  cleanDatabase,
  disconnectDatabase,
} from '../helpers/db-cleanup.helper';

describe('BankAccounts â€” Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = adminToken();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
    await app.close();
  });

  it('POST /bank-accounts â†’ 201 with valid data', async () => {
    const res = await request(app)
      .post('/bank-accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Caja Test', currency: 'USD', type: 'CHECKING' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Caja Test');
  });

  it('POST /bank-accounts â†’ 400 with missing fields', async () => {
    const res = await request(app)
      .post('/bank-accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sin moneda' });
    expect(res.status).toBe(400);
  });

  it('POST /bank-accounts â†’ 409 with duplicate name', async () => {
    await request(app)
      .post('/bank-accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicado', currency: 'USD', type: 'CHECKING' });
    const res = await request(app)
      .post('/bank-accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicado', currency: 'USD', type: 'CHECKING' });
    expect(res.status).toBe(409);
  });

  it('GET /bank-accounts â†’ 200 with list', async () => {
    const res = await request(app)
      .get('/bank-accounts')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data ?? res.body)).toBe(true);
  });

  it('GET /bank-accounts/:id â†’ 404 for unknown id', async () => {
    const res = await request(app)
      .get('/bank-accounts/nonexistent')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('DELETE /bank-accounts/:id â†’ 200 soft delete', async () => {
    const create = await request(app)
      .post('/bank-accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Delete', currency: 'USD', type: 'CHECKING' });
    const id = create.body.id;
    const del = await request(app)
      .delete(`/bank-accounts/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  it('GET /bank-accounts â†’ 401 without token', async () => {
    const res = await request(app).get('/bank-accounts');
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 9: Create financial-movements and transfers integration specs** â€”
      follow the same pattern as bank-accounts above, testing the endpoints
      listed in T-1702 task doc.

- [ ] **Step 10: Add test:integration script to apps/api/package.json**

```json
"test:integration": "jest --config jest.config.integration.js --runInBand --passWithNoTests"
```

- [ ] **Step 11: Run integration tests** (requires Docker PostgreSQL up)

```bash
pnpm infra:up  # ensure postgres is running
# Create test database if it doesn't exist:
docker exec -it atlaserp-postgres-1 psql -U postgres -c "CREATE DATABASE atlaserp_test;" 2>/dev/null || true
pnpm --filter @atlaserp/api run test:integration
```

- [ ] **Step 12: Close T-1702** â€” update task file, block-117, catalog.

---

### Task T-1703: Configure Backend E2E Tests

**Files:**

- Create: `apps/api/jest.config.e2e.js`
- Create: `apps/api/test/e2e/financial-movements-flow.e2e-spec.ts`
- Create: `apps/api/test/e2e/transfers-flow.e2e-spec.ts`
- Create: `apps/api/test/e2e/receivables-payables-flow.e2e-spec.ts`
- Create: `apps/api/test/e2e/reconciliation-flow.e2e-spec.ts`
- Create: `apps/api/test/e2e/permissions-flow.e2e-spec.ts`
- Modify: `apps/api/package.json` â€” add `test:e2e` script

- [ ] **Step 1: Create jest.config.e2e.js**

```javascript
// apps/api/jest.config.e2e.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '\\.e2e-spec\\.ts$',
  testTimeout: 60000,
  globalSetup: '<rootDir>/test/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/setup/global-teardown.ts',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/test/e2e'],
};
```

- [ ] **Step 2: Create financial-movements-flow.e2e-spec.ts** â€” implement the
      6-step flow from T-1703 task doc:
  1. Create account CTA-001 with zero balance
  2. Register 3 credits + 2 debits
  3. GET balance â†’ verify correct
  4. GET movements filtered by date range â†’ verify 5 results
  5. VOID one movement â†’ verify balance recalculates
  6. GET report â†’ VOID movement shows as VOID

- [ ] **Step 3: Create transfers-flow.e2e-spec.ts** â€” implement the 6-step
      transfer flow from T-1703.

- [ ] **Step 4: Create remaining 3 E2E spec files** â€” follow patterns from
      T-1703 task doc for receivables/payables, reconciliation, and permissions
      flows.

- [ ] **Step 5: Add test:e2e script**

```json
"test:e2e": "jest --config jest.config.e2e.js --runInBand --passWithNoTests"
```

- [ ] **Step 6: Run E2E tests**

```bash
pnpm --filter @atlaserp/api run test:e2e
pnpm --filter @atlaserp/api run typecheck
```

- [ ] **Step 7: Close T-1703** â€” update task file, block-117, catalog.

---

### Task T-1704: Configure Frontend Tests

**Files:**

- Create/Modify: `apps/web/vitest.config.ts`
- Create: `apps/web/src/test-utils/setup.ts`
- Create: `apps/web/src/test-utils/render.tsx`
- Create: `packages/ui/src/components/Button/Button.test.tsx`
- Create: `packages/ui/src/components/Badge/Badge.test.tsx`
- Create: `packages/ui/src/components/Input/Input.test.tsx`
- Create: `packages/ui/src/components/DataTable/DataTable.test.tsx`
- Create:
  `apps/web/src/modules/finops/components/BankAccountForm/BankAccountForm.test.tsx`
- Create:
  `apps/web/src/modules/finops/components/MovementsTable/MovementsTable.test.tsx`
- Modify: `apps/web/package.json` â€” add `test:watch` and `test:coverage`
  scripts

- [ ] **Step 1: Install testing-library and jsdom**

```bash
pnpm --filter @atlaserp/web add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Create/update apps/web/vitest.config.ts**

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-utils/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Create apps/web/src/test-utils/setup.ts**

```typescript
import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'IntersectionObserver', {
  value: MockIntersectionObserver,
});
```

- [ ] **Step 4: Create apps/web/src/test-utils/render.tsx**

```tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function AllProviders({ children }: { children: React.ReactNode }) {
  const qc = createQueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
```

- [ ] **Step 5: Create Button.test.tsx**

```tsx
// packages/ui/src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled').closest('button')).toBeDisabled();
  });
});
```

- [ ] **Step 6: Create Badge.test.tsx, Input.test.tsx, DataTable.test.tsx** â€”
      follow similar pattern testing the specific props of each component in
      `packages/ui/src/components/`.

- [ ] **Step 7: Create BankAccountForm.test.tsx** â€” test renders all fields,
      shows validation errors on empty submit, calls onSubmit with correct data.

- [ ] **Step 8: Create MovementsTable.test.tsx** â€” test renders with mock
      data, shows correct status badge colors, shows VOID button only for ACTIVE
      movements.

- [ ] **Step 9: Add scripts to apps/web/package.json**

```json
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 10: Run frontend tests**

```bash
pnpm --filter @atlaserp/web run test
pnpm --filter @atlaserp/web run lint
pnpm --filter @atlaserp/web run typecheck
pnpm --filter @atlaserp/web run build
```

- [ ] **Step 11: Close T-1704** â€” update task file, close block-117 (all 5
      tasks done), update catalog.

---

### Bloque 2 â€” T-1705 to T-1709 (Summary)

> Read task files in `docs/07-dev-workflow/tasks/fase-17-bloque-02/` for full
> spec.

| Task   | Deliverable                        | Key steps                                                                           |
| ------ | ---------------------------------- | ----------------------------------------------------------------------------------- |
| T-1705 | Tests de componentes UI avanzados  | ReportFilterPanel.test.tsx, MovementForm.test.tsx, TransferForm.test.tsx            |
| T-1706 | Tests desktop crÃ­ticos (Tauri)    | Install Playwright + Tauri webdriver, smoke flow offline en desktop                 |
| T-1707 | Tests Sync Core                    | Test cola local, push exitoso, push fallido + retry, resoluciÃ³n de conflictos      |
| T-1708 | Datos de prueba realistas          | Script `pnpm db:seed:volume` con 5000 movimientos, 500 transferencias, 1000 CxC/CxP |
| T-1709 | Matriz de escenarios de negocio v1 | Documento `docs/07-dev-workflow/testing-matrices/negocio-v1.md`                     |

Close block-118 after T-1709.

---

### Bloque 3 â€” T-1710 to T-1714 (Summary)

| Task   | Deliverable                                                 |
| ------ | ----------------------------------------------------------- |
| T-1710 | `docs/07-dev-workflow/testing-matrices/offline-v1.md`       |
| T-1711 | `docs/07-dev-workflow/testing-matrices/conflictos-v1.md`    |
| T-1712 | `docs/07-dev-workflow/testing-matrices/permisos-v1.md`      |
| T-1713 | `docs/07-dev-workflow/testing-matrices/regresion-v1.md`     |
| T-1714 | Playwright smoke scripts for web + API health check scripts |

Close block-119 after T-1714.

---

### Bloque 4 â€” T-1715 to T-1719 (Summary)

| Task   | Deliverable                                                      |
| ------ | ---------------------------------------------------------------- |
| T-1715 | Smoke scripts for post-deploy (staging/prod) in `scripts/smoke/` |
| T-1716 | Manual backup-restore procedure doc + test checklist             |
| T-1717 | Vitest tests for SQLite persistence (offline queue in desktop)   |
| T-1718 | Tests simulating partial sync failures and recovery              |
| T-1719 | Tests verifying idempotent sync operations                       |

Close block-120 after T-1719.

---

### Bloque 5 â€” T-1720 to T-1723 (Summary)

| Task   | Deliverable                                                             |
| ------ | ----------------------------------------------------------------------- |
| T-1720 | Performance baseline: measure API response times, document results      |
| T-1721 | Basic load test: autocannon or k6 script for key endpoints              |
| T-1722 | Fix all CRITICAL/HIGH defects found during Fase 17                      |
| T-1723 | Approval gate: run all suites, verify coverage â‰¥70%, document results |

Close block-121 + update task-pending-registry.md (Fase 17 complete).

---

## FASE 18 â€” Observability & Logging (T-1800 to T-1815)

> 4 blocks, 16 tasks. Read `docs/07-dev-workflow/task-block-122-status.md`
> through `task-block-125-status.md` + individual task files for full spec.

| Bloque            | Tasks           | Tema                                                    |
| ----------------- | --------------- | ------------------------------------------------------- |
| Bloque 1          | T-1800â€“T-1804 | Estrategia logging + logs backend/worker/sync/desktop   |
| Bloque 2          | T-1805â€“T-1809 | Logs auditorÃ­a, mÃ©tricas internas, alertas bÃ¡sicas   |
| Bloque 3          | T-1810â€“T-1814 | Dashboard observabilidad, trazas distribuidas, runbooks |
| Bloque 4 (cierre) | T-1815          | AprobaciÃ³n observabilidad mÃ­nima v1                   |

**Key deliverables:** Winston/Pino structured logger in API, log rotation
config, Prometheus metrics endpoint, Grafana dashboard (optional), runbook docs.

---

## FASE 19 â€” CI/CD & Deploy (T-1900 to T-1923)

> 5 blocks, 24 tasks. Read `docs/07-dev-workflow/task-block-126-status.md`
> through `task-block-130-status.md`.

| Bloque            | Tasks           | Tema                                                                      |
| ----------------- | --------------- | ------------------------------------------------------------------------- |
| Bloque 1          | T-1900â€“T-1904 | Ambientes (dev/staging/prod) + workflows PR + main + builds               |
| Bloque 2          | T-1905â€“T-1909 | Build worker/desktop + test pipeline + lint/typecheck + Prisma validation |
| Bloque 3          | T-1910â€“T-1914 | Docker images + publicaciÃ³n + deploy staging/prod + migraciones          |
| Bloque 4          | T-1915â€“T-1919 | Healthchecks + rollback + release strategies                              |
| Bloque 5 (cierre) | T-1920â€“T-1923 | SemVer + changelog + deploy docs + pipeline approval                      |

**Key deliverables:** `.github/workflows/` â€” pr.yml, main.yml,
build-backend.yml, build-frontend.yml, deploy-staging.yml, deploy-prod.yml.
Docker Compose prod config. Release tagging automation.

---

## FASE 20 â€” Backups & Operational Continuity (T-2000 to T-2013)

> 3 blocks, 14 tasks. Read `docs/07-dev-workflow/task-block-131-status.md`
> through `task-block-133-status.md`.

| Bloque            | Tasks           | Tema                                                                          |
| ----------------- | --------------- | ----------------------------------------------------------------------------- |
| Bloque 1          | T-2000â€“T-2004 | Backup policies (PostgreSQL, archivos, configs, desktop) + dumps automÃ¡ticos |
| Bloque 2          | T-2005â€“T-2009 | Backup archivos MinIO + configs + restore procedures + tests                  |
| Bloque 3 (cierre) | T-2010â€“T-2013 | RTO/RPO validation + monitoring + DR runbook + aprobaciÃ³n continuidad        |

**Key deliverables:** `scripts/backup/` â€” pg_dump cron scripts, MinIO sync
scripts. `docs/operations/restore-procedure.md`. Backup verification checklist.

---

## FASE 21 â€” v1 Product Close (T-2100 to T-2113)

> 3 blocks, 14 tasks. Read `docs/07-dev-workflow/task-block-134-status.md`
> through `task-block-136-status.md`.

| Bloque            | Tasks           | Tema                                                                     |
| ----------------- | --------------- | ------------------------------------------------------------------------ |
| Bloque 1          | T-2100â€“T-2104 | Checklist completitud + revisiÃ³n huecos (docs/permisos/auditorÃ­a/sync) |
| Bloque 2          | T-2105â€“T-2109 | RevisiÃ³n huecos UX/desktop/CI-CD/backups + correcciÃ³n hallazgos        |
| Bloque 3 (cierre) | T-2110â€“T-2113 | UAT interno + bugfixing + release candidate v1 + aprobaciÃ³n v1          |

**Key deliverables:** Formal release tag `v1.0.0`. Updated master catalog (all
T-0001 to T-2113 marked CERRADA). `docs/RELEASE-v1.md` release notes.

---

## FASE 22 â€” Modular Expansion Prep (T-2200 to T-2212)

> 3 blocks, 13 tasks. Read `docs/07-dev-workflow/task-block-137-status.md`
> through `task-block-139-status.md`.

| Bloque            | Tasks           | Tema                                                                                     |
| ----------------- | --------------- | ---------------------------------------------------------------------------------------- |
| Bloque 1          | T-2200â€“T-2204 | Refinamiento blueprints Accounting/HR/Purchases/Inventory + contrato FinOps-Accounting   |
| Bloque 2          | T-2205â€“T-2209 | Contratos FinOps-HR/Purchases/Inventory + estrategias posting y nÃ³mina                  |
| Bloque 3 (cierre) | T-2210â€“T-2212 | Estrategia egresos/compras + linking inventario/activos + aprobaciÃ³n expansiÃ³n modular |

**Key deliverables:** Updated domain blueprint documents in
`docs/03-domain-blueprints/`. Integration contract docs. Final approval
declaring platform ready for next module (Accounting Core / Fase 23+).

---

## Post-Execution Checklist (run at end of each Fase)

- [ ] All task files in the Fase have `Estado: closed`
- [ ] All block status files have `Estado: CERRADO` with close date
- [ ] `business-platform-master-task-catalog.md` â€” all Fase tasks marked
      `CERRADA`
- [ ] `docs/07-dev-workflow/task-pending-registry.md` â€” Fase closure entry
      added
- [ ] `pnpm --filter @atlaserp/web run lint`: 0 errors
- [ ] `pnpm --filter @atlaserp/web run typecheck`: 0 errors
- [ ] `pnpm --filter @atlaserp/web run build`: succeeds
- [ ] `pnpm --filter @atlaserp/api run typecheck`: 0 errors
- [ ] `pnpm --filter @atlaserp/api run test:unit`: 0 failures

---

## Quick Reference â€” File Patterns

| What                  | Where                                                                     |
| --------------------- | ------------------------------------------------------------------------- |
| API services          | `apps/api/src/modules/<module>/<module>.service.ts`                       |
| API spec files        | `apps/api/src/modules/<module>/<module>.service.spec.ts`                  |
| Integration tests     | `apps/api/test/integration/<module>.integration.spec.ts`                  |
| E2E backend tests     | `apps/api/test/e2e/<flow>.e2e-spec.ts`                                    |
| Web components        | `apps/web/src/modules/finops/components/<Component>/`                     |
| Web component tests   | `apps/web/src/modules/finops/components/<Component>/<Component>.test.tsx` |
| UI package components | `packages/ui/src/components/<Component>/`                                 |
| Task block status     | `docs/07-dev-workflow/task-block-NNN-status.md`                           |
| Task details          | `docs/07-dev-workflow/tasks/fase-NN-bloque-MM/T-NNNN-*.md`                |
| Master catalog        | `business-platform-master-task-catalog.md`                                |
| Pending registry      | `docs/07-dev-workflow/task-pending-registry.md`                           |
