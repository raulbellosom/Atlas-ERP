import test from "node:test";
import assert from "node:assert/strict";
import {
  enqueueModuleStoreLifecycleOperation,
  flushModuleStoreLifecycleQueue,
  listModuleStoreLifecycleQueue,
} from "../module-store/moduleStoreOfflineQueue.js";
import {
  evaluateModuleStoreLifecyclePreconditions,
  getModuleStoreLifecycleWorkerStatus,
  runModuleStoreLifecycleCycle,
} from "../module-store/moduleStoreLifecycleWorker.js";

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

function uniqueModuleKey(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

test.beforeEach(async () => {
  await clearModuleStoreLifecycleQueue();
});

test("MS-012 worker: preconditions bloquean corrida cuando esta offline", () => {
  const result = evaluateModuleStoreLifecyclePreconditions({
    isOnline: false,
    isRunning: false,
  });
  assert.equal(result.shouldRun, false);
  assert.equal(result.reason, "offline");
});

test("MS-012 worker: procesa operaciones pendientes al reconectar", async () => {
  const moduleKey = uniqueModuleKey("ms12-worker-apply");
  await enqueueModuleStoreLifecycleOperation({
    operation: "install",
    payload: {
      organizationId: "org-ms12-worker",
      moduleKey,
      version: "1.0.0",
    },
  });

  const executed = [];
  const cycle = await runModuleStoreLifecycleCycle({
    isOnline: true,
    executeOperation: async (operation, payload) => {
      executed.push({ operation, payload });
      return { status: "COMPLETED" };
    },
  });

  assert.equal(cycle.skipped, false);
  assert.equal(cycle.applied, 1);
  assert.equal(cycle.failed, 0);
  assert.equal(executed.length, 1);
  assert.equal(executed[0].operation, "install");
  assert.equal(executed[0].payload.moduleKey, moduleKey);

  const queue = await listModuleStoreLifecycleQueue();
  assert.equal(queue.filter((item) => item.payload.moduleKey === moduleKey).length, 0);
});

test("MS-012 worker: evita ejecucion concurrente", async () => {
  const moduleKey = uniqueModuleKey("ms12-worker-lock");
  await enqueueModuleStoreLifecycleOperation({
    operation: "install",
    payload: {
      organizationId: "org-ms12-worker-lock",
      moduleKey,
      version: "1.0.0",
    },
  });

  let releaseOperation;
  const blockingPromise = new Promise((resolve) => {
    releaseOperation = resolve;
  });

  const firstCycle = runModuleStoreLifecycleCycle({
    isOnline: true,
    executeOperation: async () => {
      await blockingPromise;
      return { status: "COMPLETED" };
    },
  });

  const secondCycle = await runModuleStoreLifecycleCycle({
    isOnline: true,
    executeOperation: async () => ({ status: "COMPLETED" }),
  });

  assert.equal(secondCycle.skipped, true);
  assert.equal(secondCycle.reason, "module_store_worker_in_progress");
  assert.equal(getModuleStoreLifecycleWorkerStatus().isRunning, true);

  releaseOperation();
  const firstResult = await firstCycle;
  assert.equal(firstResult.applied, 1);
});
