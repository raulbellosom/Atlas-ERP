import test from 'node:test';
import assert from 'node:assert/strict';
import { SourceType } from '@prisma/client';
import { resolveSyncConflictSource } from './sync-resolution-source';

void test('T-1040: detecta origen DESKTOP por encabezado x-atlas-client', () => {
  const source = resolveSyncConflictSource({
    'x-atlas-client': 'desktop',
  });
  assert.equal(source, SourceType.DESKTOP);
});

void test('T-1040: detecta origen DESKTOP por encabezado x-client-source', () => {
  const source = resolveSyncConflictSource({
    'x-client-source': 'desktop',
  });
  assert.equal(source, SourceType.DESKTOP);
});

void test('T-1040: fallback a WEB cuando no hay encabezados', () => {
  const source = resolveSyncConflictSource(undefined);
  assert.equal(source, SourceType.WEB);
});
