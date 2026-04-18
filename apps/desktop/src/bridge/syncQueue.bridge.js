import { invokeDesktop } from "./desktopBridge.js";

let fallbackId = 1;
const fallbackQueue = [];

function nowIso() {
  return new Date().toISOString();
}

export async function syncQueueEnqueue({
  entity,
  operation,
  payloadJson,
  priority = 100,
}) {
  const payload = { entity, operation, payloadJson, priority };
  return invokeDesktop("sync_queue_enqueue", payload, () => {
    const id = fallbackId++;
    const createdAt = nowIso();
    fallbackQueue.push({
      id,
      entity,
      operation,
      payloadJson,
      status: "pending",
      attempts: 0,
      priority,
      lastError: null,
      createdAt,
      updatedAt: createdAt,
    });
    return id;
  });
}

export async function syncQueueList({ status, limit = 100 } = {}) {
  return invokeDesktop("sync_queue_list", { status, limit }, () => {
    const data = status
      ? fallbackQueue.filter((item) => item.status === status)
      : [...fallbackQueue];
    return data
      .sort((a, b) => (a.priority - b.priority) || (a.id - b.id))
      .slice(0, limit);
  });
}

export async function syncQueueMarkProcessing(id) {
  return invokeDesktop("sync_queue_mark_processing", { id }, () => {
    const item = fallbackQueue.find((row) => row.id === id);
    if (!item || !["pending", "failed"].includes(item.status)) {
      return false;
    }
    item.status = "processing";
    item.attempts += 1;
    item.updatedAt = nowIso();
    return true;
  });
}

export async function syncQueueMarkDone(id) {
  return invokeDesktop("sync_queue_mark_done", { id }, () => {
    const item = fallbackQueue.find((row) => row.id === id);
    if (!item) {
      return false;
    }
    item.status = "done";
    item.lastError = null;
    item.updatedAt = nowIso();
    return true;
  });
}

export async function syncQueueMarkFailed(id, lastError = null) {
  return invokeDesktop("sync_queue_mark_failed", { id, lastError }, () => {
    const item = fallbackQueue.find((row) => row.id === id);
    if (!item) {
      return false;
    }
    item.status = "failed";
    item.lastError = lastError;
    item.updatedAt = nowIso();
    return true;
  });
}

export async function syncQueuePendingCount() {
  return invokeDesktop("sync_queue_pending_count", {}, () =>
    fallbackQueue.filter((item) => item.status !== "done").length,
  );
}

export async function syncQueueSummary() {
  return invokeDesktop("sync_queue_summary", {}, () => {
    const pending = fallbackQueue.filter((item) => item.status === "pending").length;
    const processing = fallbackQueue.filter((item) => item.status === "processing").length;
    const failed = fallbackQueue.filter((item) => item.status === "failed").length;
    const done = fallbackQueue.filter((item) => item.status === "done").length;

    return {
      pending,
      processing,
      failed,
      done,
      total: fallbackQueue.length,
    };
  });
}

export async function syncQueueRecoverAfterRestart() {
  return invokeDesktop("sync_queue_recover_after_restart", {}, () => {
    let recovered = 0;
    fallbackQueue.forEach((item) => {
      if (item.status === "processing") {
        recovered += 1;
        item.status = "pending";
        item.lastError = item.lastError || "Recuperado tras reinicio en fallback web.";
        item.updatedAt = nowIso();
      }
    });
    return recovered;
  });
}
