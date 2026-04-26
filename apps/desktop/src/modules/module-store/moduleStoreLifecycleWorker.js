import { desktopApiClient } from "../../api/client.js";
import { flushModuleStoreLifecycleQueue } from "./moduleStoreOfflineQueue.js";

let _isRunning = false;
let _lastRunAt = null;
let _lastError = null;

function unwrapPayload(payload) {
  return payload?.data ?? payload;
}

async function executeModuleStoreOperation(operation, payload) {
  if (operation === "install") {
    return desktopApiClient.post("/v1/module-store/install", payload);
  }
  if (operation === "uninstall") {
    return desktopApiClient.post("/v1/module-store/uninstall", payload);
  }
  if (operation === "upgrade") {
    return desktopApiClient.post("/v1/module-store/upgrade", payload);
  }
  throw new Error(`Operacion de module-store no soportada por worker: ${operation}`);
}

export function evaluateModuleStoreLifecyclePreconditions({ isOnline, isRunning }) {
  if (isRunning) {
    return { shouldRun: false, reason: "module_store_worker_in_progress" };
  }
  if (!isOnline) {
    return { shouldRun: false, reason: "offline" };
  }
  return { shouldRun: true };
}

export async function runModuleStoreLifecycleCycle({
  isOnline,
  executeOperation = executeModuleStoreOperation,
  onOperationCompleted,
}) {
  const preconditions = evaluateModuleStoreLifecyclePreconditions({
    isOnline,
    isRunning: _isRunning,
  });

  if (!preconditions.shouldRun) {
    return { skipped: true, reason: preconditions.reason, applied: 0, reconciled: 0, failed: 0 };
  }

  _isRunning = true;
  _lastError = null;

  try {
    const summary = await flushModuleStoreLifecycleQueue({
      isOnline: true,
      executeOperation: async (operation, payload) => {
        const response = await executeOperation(operation, payload);
        onOperationCompleted?.(operation, payload, unwrapPayload(response));
        return response;
      },
    });
    _lastRunAt = new Date().toISOString();
    return summary;
  } catch (error) {
    _lastError = error instanceof Error ? error.message : String(error);
    return {
      skipped: false,
      reason: "worker_error",
      applied: 0,
      reconciled: 0,
      failed: 0,
      error: _lastError,
    };
  } finally {
    _isRunning = false;
  }
}

export function getModuleStoreLifecycleWorkerStatus() {
  return {
    isRunning: _isRunning,
    lastRunAt: _lastRunAt,
    lastError: _lastError,
  };
}
