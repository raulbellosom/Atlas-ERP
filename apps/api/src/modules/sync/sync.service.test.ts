import test from 'node:test';
import assert from 'node:assert/strict';
import {
  comparePayloads,
  computeMinimalDiff,
  getAutoResolveStrategy,
  isDangerousMerge,
} from './sync.service';

void test('T-1042: detecta conflicto de edición y lista campos cambiados', () => {
  const local = {
    amount: 150,
    note: 'ajuste manual',
    metadata: { terminal: 'caja-01', user: 'u-local' },
  };
  const server = {
    amount: 100,
    note: 'registro previo',
    metadata: { terminal: 'caja-01', user: 'u-server' },
  };

  const result = comparePayloads(local, server);
  assert.equal(result.hasConflict, true);
  assert.deepEqual(result.changedKeys.sort(), ['amount', 'metadata', 'note']);
});

void test('T-1042: computeMinimalDiff separa added/removed/changed', () => {
  const local = { a: 1, c: 3, extra: true };
  const server = { a: 1, b: 2, c: 4 };

  const diff = computeMinimalDiff(local, server);
  assert.deepEqual(diff.added, ['extra']);
  assert.deepEqual(diff.removed, ['b']);
  assert.deepEqual(diff.changed, {
    c: { from: 4, to: 3 },
  });
});

void test('T-1043: payload idéntico se considera duplicado sin conflicto', () => {
  const payloadA = {
    id: 'mov_01',
    amount: 1000,
    currency: 'MXN',
    tags: ['ventas', 'local'],
  };
  const payloadB = {
    id: 'mov_01',
    amount: 1000,
    currency: 'MXN',
    tags: ['ventas', 'local'],
  };

  const result = comparePayloads(payloadA, payloadB);
  assert.equal(result.hasConflict, false);
  assert.deepEqual(result.changedKeys, []);
});

void test('T-1044: delete siempre desactiva auto-resolución', () => {
  assert.equal(getAutoResolveStrategy('setting', 'delete'), 'none');
  assert.equal(getAutoResolveStrategy('feature_flag', 'delete'), 'none');
});

void test('T-1044: entidades financieras se marcan como merge peligroso', () => {
  assert.equal(isDangerousMerge('financial_movement', 'update'), true);
  assert.equal(isDangerousMerge('financial_transfer', 'create'), true);
  assert.equal(isDangerousMerge('financial_account', 'update'), true);
  assert.equal(isDangerousMerge('setting', 'update'), false);
});
