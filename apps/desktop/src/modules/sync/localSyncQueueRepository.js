import {
  syncQueueEnqueue,
  syncQueueList,
  syncQueueMarkDone,
  syncQueueMarkFailed,
  syncQueueMarkProcessing,
  syncQueuePendingCount,
  syncQueueRecoverAfterRestart,
  syncQueueSummary,
} from "../../bridge/syncQueue.bridge.js";

export async function enqueueSyncChange(entity, operation, payload, priority = 100) {
  const payloadJson = JSON.stringify(payload ?? {});
  return syncQueueEnqueue({ entity, operation, payloadJson, priority });
}

export async function listPendingSyncChanges(limit = 100) {
  return syncQueueList({ status: "pending", limit });
}

export async function listAllSyncChanges(limit = 100) {
  return syncQueueList({ limit });
}

export async function markSyncChangeProcessing(id) {
  return syncQueueMarkProcessing(id);
}

export async function markSyncChangeDone(id) {
  return syncQueueMarkDone(id);
}

export async function markSyncChangeFailed(id, errorMessage) {
  return syncQueueMarkFailed(id, errorMessage);
}

export async function countPendingSyncChanges() {
  return syncQueuePendingCount();
}

export async function summarizeSyncQueue() {
  return syncQueueSummary();
}

export async function recoverSyncQueueAfterRestart() {
  return syncQueueRecoverAfterRestart();
}
