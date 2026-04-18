/**
 * T-1335 — Pruebas de integración del módulo Financial Operations Core
 *
 * Valida que cada servicio y controlador del módulo exporta los métodos
 * y handlers esperados, garantizando integridad estructural del backend.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { BankAccountsService } from '../bank-accounts/bank-accounts.service';
import { FinancialMovementsService } from './financial-movements.service';
import { TransfersService } from '../transfers/transfers.service';
import { ReconciliationService } from '../reconciliation/reconciliation.service';
import { BalanceSnapshotsService } from '../balance-snapshots/balance-snapshots.service';
import { ReceivablesLiteService } from '../receivables-lite/receivables-lite.service';
import { PayablesLiteService } from '../payables-lite/payables-lite.service';

import { BankAccountsController } from '../bank-accounts/bank-accounts.controller';
import { FinancialMovementsController } from './financial-movements.controller';
import { TransfersController } from '../transfers/transfers.controller';
import { ReconciliationController } from '../reconciliation/reconciliation.controller';
import { BalanceSnapshotsController } from '../balance-snapshots/balance-snapshots.controller';
import { ReceivablesLiteController } from '../receivables-lite/receivables-lite.controller';
import { PayablesLiteController } from '../payables-lite/payables-lite.controller';

// ── Helpers ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPrototypeMethods(cls: new (...args: any[]) => any): string[] {
  return Object.getOwnPropertyNames(cls.prototype).filter(
    (m) => m !== 'constructor' && typeof cls.prototype[m] === 'function',
  );
}

// ── BankAccountsService ─────────────────────────────────────────────

void test('T-1335: BankAccountsService exporta CRUD base', () => {
  const methods = getPrototypeMethods(BankAccountsService);
  for (const expected of ['create', 'findAll', 'findOneById', 'update', 'softDelete']) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

void test('T-1335: BankAccountsService exporta métodos de saldo', () => {
  const methods = getPrototypeMethods(BankAccountsService);
  for (const expected of ['countActiveByOrganization', 'getBalanceByAccount', 'getBalanceSummaryByOrganization']) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

// ── FinancialMovementsService ───────────────────────────────────────

void test('T-1335: FinancialMovementsService exporta CRUD base', () => {
  const methods = getPrototypeMethods(FinancialMovementsService);
  for (const expected of ['create', 'findAll', 'findOneById', 'update', 'softDelete']) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

void test('T-1335: FinancialMovementsService exporta gestión de comprobantes', () => {
  const methods = getPrototypeMethods(FinancialMovementsService);
  for (const expected of ['uploadProof', 'listProofs']) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

// ── TransfersService ────────────────────────────────────────────────

void test('T-1335: TransfersService exporta CRUD base', () => {
  const methods = getPrototypeMethods(TransfersService);
  for (const expected of ['create', 'findAll', 'findOneById', 'update', 'softDelete']) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

// ── ReconciliationService ───────────────────────────────────────────

void test('T-1335: ReconciliationService exporta gestión de sesiones', () => {
  const methods = getPrototypeMethods(ReconciliationService);
  for (const expected of [
    'createSession',
    'findSessions',
    'findSessionById',
    'updateSession',
    'reconcileSession',
    'closeSession',
  ]) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

void test('T-1335: ReconciliationService exporta gestión de items', () => {
  const methods = getPrototypeMethods(ReconciliationService);
  for (const expected of ['createItem', 'findSessionItems', 'updateItem']) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

// ── BalanceSnapshotsService ─────────────────────────────────────────

void test('T-1335: BalanceSnapshotsService exporta métodos esperados', () => {
  const methods = getPrototypeMethods(BalanceSnapshotsService);
  for (const expected of ['create', 'findAll', 'findOneById', 'findLatestByBankAccount']) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

// ── ReceivablesLiteService ──────────────────────────────────────────

void test('T-1335: ReceivablesLiteService exporta CRUD base', () => {
  const methods = getPrototypeMethods(ReceivablesLiteService);
  for (const expected of ['create', 'findAll', 'findOneById', 'update', 'softDelete']) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

void test('T-1335: ReceivablesLiteService exporta conteo de vencidos', () => {
  const methods = getPrototypeMethods(ReceivablesLiteService);
  assert.ok(methods.includes('countOverdueByOrganization'), 'Falta countOverdueByOrganization');
});

// ── PayablesLiteService ─────────────────────────────────────────────

void test('T-1335: PayablesLiteService exporta CRUD base', () => {
  const methods = getPrototypeMethods(PayablesLiteService);
  for (const expected of ['create', 'findAll', 'findOneById', 'update', 'softDelete']) {
    assert.ok(methods.includes(expected), `Falta método: ${expected}`);
  }
});

void test('T-1335: PayablesLiteService exporta conteo de vencidos', () => {
  const methods = getPrototypeMethods(PayablesLiteService);
  assert.ok(methods.includes('countOverdueByOrganization'), 'Falta countOverdueByOrganization');
});

// ── Controllers — handlers esperados ────────────────────────────────

void test('T-1335: BankAccountsController expone handlers CRUD + balance', () => {
  const handlers = getPrototypeMethods(BankAccountsController);
  for (const expected of [
    'create',
    'findAll',
    'findOne',
    'update',
    'softDelete',
    'countActiveByOrganization',
    'getBalanceByAccount',
    'getBalanceSummaryByOrganization',
  ]) {
    assert.ok(handlers.includes(expected), `Falta handler: ${expected}`);
  }
});

void test('T-1335: FinancialMovementsController expone handlers CRUD + attachments', () => {
  const handlers = getPrototypeMethods(FinancialMovementsController);
  for (const expected of [
    'create',
    'findAll',
    'findAllByFilters',
    'findOne',
    'update',
    'softDelete',
    'uploadProof',
    'listProofs',
  ]) {
    assert.ok(handlers.includes(expected), `Falta handler: ${expected}`);
  }
});

void test('T-1335: TransfersController expone handlers CRUD', () => {
  const handlers = getPrototypeMethods(TransfersController);
  for (const expected of ['create', 'findAll', 'findOne', 'update', 'softDelete']) {
    assert.ok(handlers.includes(expected), `Falta handler: ${expected}`);
  }
});

void test('T-1335: ReconciliationController expone handlers de sesión', () => {
  const handlers = getPrototypeMethods(ReconciliationController);
  for (const expected of [
    'findSessions',
    'findSessionById',
    'findSessionItems',
    'reconcileSession',
    'closeSession',
    'approveSession',
  ]) {
    assert.ok(handlers.includes(expected), `Falta handler: ${expected}`);
  }
});

void test('T-1335: BalanceSnapshotsController expone handlers de consulta', () => {
  const handlers = getPrototypeMethods(BalanceSnapshotsController);
  for (const expected of ['findAll', 'findLatestByBankAccount', 'findOne']) {
    assert.ok(handlers.includes(expected), `Falta handler: ${expected}`);
  }
});

void test('T-1335: ReceivablesLiteController expone handlers CRUD + overdue', () => {
  const handlers = getPrototypeMethods(ReceivablesLiteController);
  for (const expected of [
    'create',
    'findAll',
    'findOne',
    'update',
    'softDelete',
    'countOverdueByOrganization',
  ]) {
    assert.ok(handlers.includes(expected), `Falta handler: ${expected}`);
  }
});

void test('T-1335: PayablesLiteController expone handlers CRUD + overdue', () => {
  const handlers = getPrototypeMethods(PayablesLiteController);
  for (const expected of [
    'create',
    'findAll',
    'findOne',
    'update',
    'softDelete',
    'countOverdueByOrganization',
  ]) {
    assert.ok(handlers.includes(expected), `Falta handler: ${expected}`);
  }
});

// ── Consistencia Service ↔ Controller ───────────────────────────────

void test('T-1335: cada servicio financiero tiene al menos 3 métodos públicos', () => {
  const services = [
    BankAccountsService,
    FinancialMovementsService,
    TransfersService,
    ReconciliationService,
    BalanceSnapshotsService,
    ReceivablesLiteService,
    PayablesLiteService,
  ] as const;

  for (const Service of services) {
    const methods = getPrototypeMethods(Service);
    assert.ok(
      methods.length >= 3,
      `${Service.name} tiene solo ${methods.length} métodos, se esperan al menos 3.`,
    );
  }
});

void test('T-1335: cada controlador financiero tiene al menos 2 handlers', () => {
  const controllers = [
    BankAccountsController,
    FinancialMovementsController,
    TransfersController,
    ReconciliationController,
    BalanceSnapshotsController,
    ReceivablesLiteController,
    PayablesLiteController,
  ] as const;

  for (const Controller of controllers) {
    const handlers = getPrototypeMethods(Controller);
    assert.ok(
      handlers.length >= 2,
      `${Controller.name} tiene solo ${handlers.length} handlers, se esperan al menos 2.`,
    );
  }
});
