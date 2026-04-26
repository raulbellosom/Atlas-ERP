import {
  syncItemEnqueue,
  syncItemFindByIdempotencyKey,
  syncItemList,
  syncItemListReady,
  syncItemMarkApproved,
  syncItemMarkDone,
  syncItemMarkFailed,
  syncItemMarkProcessing,
  syncItemMarkRejected,
  syncItemPendingCount,
} from "../../bridge/syncItems.bridge.js";

function normalizeSyncItem(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    itemId: record.item_id ?? record.itemId ?? null,
    entity: record.entity,
    entityId: record.entity_id ?? record.entityId ?? null,
    operation: record.operation,
    payloadJson: record.payload_json ?? record.payloadJson ?? "{}",
    source: record.source ?? "desktop",
    occurredAt: record.occurred_at ?? record.occurredAt ?? null,
    idempotencyKey: record.idempotency_key ?? record.idempotencyKey ?? null,
    fingerprint: record.fingerprint ?? null,
    approvalStatus: record.approval_status ?? record.approvalStatus ?? "pending_review",
    approvalReason: record.approval_reason ?? record.approvalReason ?? null,
    status: record.status ?? "pending",
    attempts: record.attempts ?? 0,
    priority: record.priority ?? 100,
    retryAt: record.retry_at ?? record.retryAt ?? null,
    lastError: record.last_error ?? record.lastError ?? null,
    createdAt: record.created_at ?? record.createdAt ?? null,
    updatedAt: record.updated_at ?? record.updatedAt ?? null,
  };
}

export async function createSyncItem(input) {
  return syncItemEnqueue(input);
}

export async function listSyncItems({ status, limit = 200 } = {}) {
  const rows = await syncItemList({ status, limit });
  return rows.map(normalizeSyncItem).filter(Boolean);
}

export async function findSyncItemByIdempotencyKey(idempotencyKey) {
  const row = await syncItemFindByIdempotencyKey(idempotencyKey);
  return normalizeSyncItem(row);
}

export async function approveSyncItem(id, reason = null) {
  return syncItemMarkApproved(id, reason);
}

export async function rejectSyncItem(id, reason) {
  return syncItemMarkRejected(id, reason);
}

export async function countPendingSyncItems() {
  return syncItemPendingCount();
}

export async function listReadySyncItems({ limit = 50 } = {}) {
  const rows = await syncItemListReady({ limit });
  return rows.map(normalizeSyncItem).filter(Boolean);
}

export async function markSyncItemProcessing(id) {
  return syncItemMarkProcessing(id);
}

export async function markSyncItemDone(id, sessionRef = null) {
  return syncItemMarkDone(id, sessionRef);
}

export async function markSyncItemFailed(id, lastError = null) {
  return syncItemMarkFailed(id, lastError);
}
