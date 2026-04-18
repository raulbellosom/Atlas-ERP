import assert from 'node:assert/strict';
import test from 'node:test';
import { ALLOWED_SYNC_ENTITIES } from './dto/sync-batch-item.dto';
import { getAutoResolveStrategy, isDangerousMerge } from './sync.service';

const FINOPS_SYNC_ENTITIES = [
  'bank_account',
  'financial_movement',
  'financial_transfer',
  'receivable',
  'payable',
  'reconciliation_session',
] as const;

void test('T-1333: entidades financieras permitidas en sync batch', () => {
  for (const entity of FINOPS_SYNC_ENTITIES) {
    assert.equal(
      ALLOWED_SYNC_ENTITIES.includes(entity),
      true,
      `La entidad ${entity} debe estar permitida en sync batch.`,
    );
  }
});

void test('T-1333: entidades financieras no se auto-resuelven', () => {
  for (const entity of FINOPS_SYNC_ENTITIES) {
    assert.equal(getAutoResolveStrategy(entity, 'create'), 'none');
    assert.equal(getAutoResolveStrategy(entity, 'update'), 'none');
    assert.equal(getAutoResolveStrategy(entity, 'upsert'), 'none');
  }
});

void test('T-1334: entidades financieras se marcan como merge peligroso', () => {
  for (const entity of FINOPS_SYNC_ENTITIES) {
    assert.equal(isDangerousMerge(entity, 'update'), true);
  }

  assert.equal(isDangerousMerge('feature_flag', 'update'), false);
});
