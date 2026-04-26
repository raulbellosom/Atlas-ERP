import test from "node:test";
import assert from "node:assert/strict";
import {
  enqueueModuleStoreLifecycleOperation,
  flushModuleStoreLifecycleQueue,
  listModuleStoreLifecycleQueue,
} from "../module-store/moduleStoreOfflineQueue.js";

function uniqueModuleKey(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function clearModuleStoreLifecycleQueue() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const queue = await listModuleStoreLifecycleQueue();
    if (queue.length === 0) return;

    await flushModuleStoreLifecycleQueue({
      isOnline: true,
      executeOperation: async () => undefined,
    });
  }
}

test.beforeEach(async () => {
  await clearModuleStoreLifecycleQueue();
});

test("MS-012: idempotencia por requestId evita duplicados en cola module_store", async () => {
  const moduleKey = uniqueModuleKey("ms12-idempotent");
  const requestId = `req-${moduleKey}`;
  const payload = {
    organizationId: "org-ms12-idempotent",
    moduleKey,
    version: "1.0.0",
    requestId,
  };

  const first = await enqueueModuleStoreLifecycleOperation({
    operation: "install",
    payload,
  });
  const second = await enqueueModuleStoreLifecycleOperation({
    operation: "install",
    payload,
  });

  assert.equal(first.accepted, true);
  assert.equal(second.accepted, false);
  assert.equal(second.reason, "idempotent_request_id");

  const queue = await listModuleStoreLifecycleQueue();
  const matches = queue.filter((item) => item.payload.moduleKey === moduleKey);
  assert.equal(matches.length, 1);
});

test("MS-012: conflicto install->uninstall antes de sync se reconcilia como no-op", async () => {
  const moduleKey = uniqueModuleKey("ms12-cancel");
  const install = await enqueueModuleStoreLifecycleOperation({
    operation: "install",
    payload: {
      organizationId: "org-ms12-cancel",
      moduleKey,
      version: "1.0.0",
    },
  });
  const uninstall = await enqueueModuleStoreLifecycleOperation({
    operation: "uninstall",
    payload: {
      organizationId: "org-ms12-cancel",
      moduleKey,
    },
  });

  assert.equal(install.accepted, true);
  assert.equal(uninstall.accepted, false);
  assert.equal(uninstall.reason, "conflict_install_then_uninstall_cancelled");

  const queue = await listModuleStoreLifecycleQueue();
  const unresolved = queue.filter((item) => item.payload.moduleKey === moduleKey);
  assert.equal(unresolved.length, 0);
});

test("MS-012: conflicto install->upgrade colapsa a install objetivo final", async () => {
  const moduleKey = uniqueModuleKey("ms12-collapse-upgrade");
  await enqueueModuleStoreLifecycleOperation({
    operation: "install",
    payload: {
      organizationId: "org-ms12-collapse",
      moduleKey,
      version: "1.0.0",
    },
  });

  const collapsed = await enqueueModuleStoreLifecycleOperation({
    operation: "upgrade",
    payload: {
      organizationId: "org-ms12-collapse",
      moduleKey,
      fromVersion: "1.0.0",
      toVersion: "1.1.0",
    },
  });

  assert.equal(collapsed.accepted, true);
  assert.equal(
    collapsed.reason,
    "conflict_install_then_upgrade_collapsed_to_install_target",
  );

  const queue = await listModuleStoreLifecycleQueue();
  const unresolved = queue.filter((item) => item.payload.moduleKey === moduleKey);
  assert.equal(unresolved.length, 1);
  assert.equal(unresolved[0].operation, "install");
  assert.equal(unresolved[0].payload.version, "1.1.0");
});

test("MS-012: flush reconcilia conflicto idempotente del backend (install ya instalado)", async () => {
  const moduleKey = uniqueModuleKey("ms12-flush-reconcile");
  await enqueueModuleStoreLifecycleOperation({
    operation: "install",
    payload: {
      organizationId: "org-ms12-flush",
      moduleKey,
      version: "1.0.0",
    },
  });

  const result = await flushModuleStoreLifecycleQueue({
    isOnline: true,
    executeOperation: async () => {
      throw new Error('El modulo "x" ya esta instalado.');
    },
  });

  assert.equal(result.reconciled, 1);
  assert.equal(result.failed, 0);

  const queue = await listModuleStoreLifecycleQueue();
  const unresolved = queue.filter((item) => item.payload.moduleKey === moduleKey);
  assert.equal(unresolved.length, 0);
});
