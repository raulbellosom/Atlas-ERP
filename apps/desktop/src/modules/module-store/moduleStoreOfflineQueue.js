import {
  enqueueSyncChange,
  listAllSyncChanges,
  markSyncChangeDone,
  markSyncChangeFailed,
  markSyncChangeProcessing,
} from "../sync/localSyncQueueRepository.js";

export const MODULE_STORE_QUEUE_ENTITY = "module_store";

const MODULE_STORE_OPERATION_TYPES = new Set(["install", "uninstall", "upgrade"]);

function buildRequestId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function toSafeErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error ?? "unknown_error");
}

function parseQueuePayload(item) {
  try {
    return JSON.parse(item.payloadJson ?? "{}");
  } catch {
    return {};
  }
}

function normalizeOperationPayload(operation, payload) {
  const normalized = {
    ...(payload ?? {}),
    requestId: payload?.requestId ?? buildRequestId(`module-store-${operation}`),
  };

  if (!normalized.organizationId) {
    throw new Error("organizationId es requerido para lifecycle de Module Store.");
  }
  if (!normalized.moduleKey) {
    throw new Error("moduleKey es requerido para lifecycle de Module Store.");
  }

  if (operation === "install" && !normalized.version) {
    throw new Error("version es requerida para operacion install.");
  }

  if (operation === "upgrade") {
    if (!normalized.fromVersion || !normalized.toVersion) {
      throw new Error("fromVersion/toVersion son requeridas para upgrade.");
    }
  }

  return normalized;
}

function buildLifecycleKey(payload) {
  return `${payload.organizationId}:${payload.moduleKey}`;
}

function sortByPriorityAndId(items) {
  return [...items].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100) || a.id - b.id);
}

async function listPendingLifecycleItems() {
  const queue = await listAllSyncChanges(500);
  return sortByPriorityAndId(
    queue.filter(
      (item) =>
        item.entity === MODULE_STORE_QUEUE_ENTITY &&
        (item.status === "pending" || item.status === "failed"),
    ),
  );
}

function shouldReconcileAsDone(operation, errorMessage) {
  const msg = String(errorMessage ?? "").toLowerCase();
  if (!msg) return false;

  if (operation === "install" && msg.includes("ya esta instalado")) {
    return true;
  }
  if (operation === "uninstall" && msg.includes("no esta instalado")) {
    return true;
  }
  if (
    operation === "upgrade" &&
    (msg.includes("no esta instalado") ||
      msg.includes("no coincide con fromversion") ||
      msg.includes("no pueden ser iguales"))
  ) {
    return true;
  }
  return false;
}

function toLifecycleOperation(item) {
  return {
    id: item.id,
    operation: item.operation,
    status: item.status,
    attempts: item.attempts,
    priority: item.priority,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    payload: parseQueuePayload(item),
  };
}

export async function listModuleStoreLifecycleQueue() {
  const queue = await listAllSyncChanges(500);
  return sortByPriorityAndId(
    queue.filter(
      (item) => item.entity === MODULE_STORE_QUEUE_ENTITY && item.status !== "done",
    ),
  ).map(toLifecycleOperation);
}

export async function enqueueModuleStoreLifecycleOperation({
  operation,
  payload,
  priority = 80,
}) {
  if (!MODULE_STORE_OPERATION_TYPES.has(operation)) {
    throw new Error(`Operacion de Module Store no soportada: ${operation}`);
  }

  const normalizedPayload = normalizeOperationPayload(operation, payload);
  const lifecycleKey = buildLifecycleKey(normalizedPayload);
  const pending = await listPendingLifecycleItems();
  const sameModulePending = pending.filter((item) => {
    const itemPayload = parseQueuePayload(item);
    return buildLifecycleKey(itemPayload) === lifecycleKey;
  });

  const byRequestId = sameModulePending.find((item) => {
    const itemPayload = parseQueuePayload(item);
    return itemPayload.requestId === normalizedPayload.requestId;
  });
  if (byRequestId) {
    return {
      accepted: false,
      reason: "idempotent_request_id",
      queueItemId: byRequestId.id,
      payload: parseQueuePayload(byRequestId),
    };
  }

  const latest = sameModulePending[sameModulePending.length - 1] ?? null;
  if (latest) {
    const latestPayload = parseQueuePayload(latest);

    // Conflict policy for lifecycle queue:
    // - install -> uninstall before sync: cancel both (no-op).
    // - uninstall -> install before sync: replace with latest install.
    // - install -> upgrade before sync: replace with install(target=toVersion).
    // - upgrade/uninstall chains: keep latest intent only.
    if (latest.operation === "install" && operation === "uninstall") {
      await markSyncChangeDone(latest.id);
      return {
        accepted: false,
        reason: "conflict_install_then_uninstall_cancelled",
        queueItemId: latest.id,
        payload: latestPayload,
      };
    }

    if (latest.operation === "install" && operation === "upgrade") {
      await markSyncChangeDone(latest.id);
      const upgradedInstallPayload = {
        organizationId: normalizedPayload.organizationId,
        moduleKey: normalizedPayload.moduleKey,
        version: normalizedPayload.toVersion,
        requestId: normalizedPayload.requestId,
      };
      const id = await enqueueSyncChange(
        MODULE_STORE_QUEUE_ENTITY,
        "install",
        upgradedInstallPayload,
        priority,
      );
      return {
        accepted: true,
        reason: "conflict_install_then_upgrade_collapsed_to_install_target",
        queueItemId: id,
        payload: upgradedInstallPayload,
      };
    }

    if (
      (latest.operation === "uninstall" && operation === "install") ||
      (latest.operation === "upgrade" && operation === "uninstall") ||
      (latest.operation === "upgrade" && operation === "upgrade") ||
      (latest.operation === "install" && operation === "install")
    ) {
      await markSyncChangeDone(latest.id);
    }
  }

  const queueItemId = await enqueueSyncChange(
    MODULE_STORE_QUEUE_ENTITY,
    operation,
    normalizedPayload,
    priority,
  );

  return {
    accepted: true,
    reason: "queued",
    queueItemId,
    payload: normalizedPayload,
  };
}

export async function flushModuleStoreLifecycleQueue({ isOnline, executeOperation }) {
  if (!isOnline) {
    return {
      skipped: true,
      reason: "offline",
      applied: 0,
      reconciled: 0,
      failed: 0,
    };
  }

  const pending = await listPendingLifecycleItems();
  if (pending.length === 0) {
    return {
      skipped: false,
      reason: "empty",
      applied: 0,
      reconciled: 0,
      failed: 0,
    };
  }

  let applied = 0;
  let reconciled = 0;
  let failed = 0;

  for (const item of pending) {
    const payload = parseQueuePayload(item);
    try {
      await markSyncChangeProcessing(item.id);
      await executeOperation(item.operation, payload);
      await markSyncChangeDone(item.id);
      applied += 1;
    } catch (error) {
      const message = toSafeErrorMessage(error);
      if (shouldReconcileAsDone(item.operation, message)) {
        await markSyncChangeDone(item.id);
        reconciled += 1;
        continue;
      }
      await markSyncChangeFailed(item.id, message);
      failed += 1;
    }
  }

  return {
    skipped: false,
    reason: "processed",
    applied,
    reconciled,
    failed,
  };
}
