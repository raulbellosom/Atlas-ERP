import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateSyncPreconditions,
  summarizeBatchResults,
} from "./syncWorker.js";

test("T-1041: flujo online->offline->online cambia decisión de sync", () => {
  const online1 = evaluateSyncPreconditions({
    isSyncing: false,
    networkOnline: true,
    hasAccessToken: true,
  });
  assert.equal(online1.shouldRun, true);

  const offline = evaluateSyncPreconditions({
    isSyncing: false,
    networkOnline: false,
    hasAccessToken: true,
  });
  assert.equal(offline.shouldRun, false);
  assert.equal(offline.reason, "offline");

  const online2 = evaluateSyncPreconditions({
    isSyncing: false,
    networkOnline: true,
    hasAccessToken: true,
  });
  assert.equal(online2.shouldRun, true);
});

test("T-1041: sync en progreso bloquea nuevo ciclo", () => {
  const locked = evaluateSyncPreconditions({
    isSyncing: true,
    networkOnline: true,
    hasAccessToken: true,
  });
  assert.equal(locked.shouldRun, false);
  assert.equal(locked.reason, "sync_in_progress");
});

test("helper summarizeBatchResults resume synced/failed", () => {
  const result = summarizeBatchResults([
    { status: "synced" },
    { status: "idempotent" },
    { status: "conflict" },
    { status: "error" },
  ]);

  assert.deepEqual(result, { synced: 2, failed: 2 });
});

