import { invokeDesktop } from "./desktopBridge.js";

let fallbackSequence = 1;
const fallbackItems = [];

function nowIso() {
  return new Date().toISOString();
}

export async function syncItemEnqueue({
  itemId,
  entity,
  entityId,
  operation,
  payloadJson,
  source = "desktop",
  occurredAt,
  idempotencyKey,
  fingerprint,
  priority = 100,
  approvalStatus = "pending_review",
  approvalReason = null,
}) {
  const payload = {
    itemId,
    entity,
    entityId,
    operation,
    payloadJson,
    source,
    occurredAt,
    idempotencyKey,
    fingerprint,
    priority,
    approvalStatus,
    approvalReason,
  };

  return invokeDesktop("sync_item_enqueue", payload, () => {
    const id = fallbackSequence++;
    fallbackItems.push({
      id,
      item_id: itemId,
      entity,
      entity_id: entityId,
      operation,
      payload_json: payloadJson,
      source,
      occurred_at: occurredAt || nowIso(),
      idempotency_key: idempotencyKey,
      fingerprint,
      approval_status: approvalStatus,
      approval_reason: approvalReason,
      status: approvalStatus === "rejected" ? "canceled" : "pending",
      attempts: 0,
      priority,
      retry_at: null,
      last_error: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    return id;
  });
}

export async function syncItemList({ status, limit = 200 } = {}) {
  return invokeDesktop("sync_item_list", { status, limit }, () => {
    const data = status
      ? fallbackItems.filter((item) => item.status === status)
      : [...fallbackItems];

    return data
      .sort((a, b) => {
        const priority = (a.priority || 100) - (b.priority || 100);
        if (priority !== 0) {
          return priority;
        }

        const occurred = String(a.occurred_at || "").localeCompare(String(b.occurred_at || ""));
        if (occurred !== 0) {
          return occurred;
        }

        return (a.id || 0) - (b.id || 0);
      })
      .slice(0, limit);
  });
}

export async function syncItemFindByIdempotencyKey(idempotencyKey) {
  return invokeDesktop("sync_item_find_by_idempotency_key", { idempotencyKey }, () => {
    const found = fallbackItems
      .filter((item) => item.idempotency_key === idempotencyKey)
      .sort((a, b) => b.id - a.id)[0];

    return found || null;
  });
}

export async function syncItemMarkApproved(id, reason = null) {
  return invokeDesktop("sync_item_mark_approved", { id, reason }, () => {
    const item = fallbackItems.find((candidate) => candidate.id === id);
    if (!item || item.status === "canceled") {
      return false;
    }

    item.approval_status = "approved";
    item.approval_reason = reason;
    item.updated_at = nowIso();
    return true;
  });
}

export async function syncItemMarkRejected(id, reason) {
  return invokeDesktop("sync_item_mark_rejected", { id, reason }, () => {
    const item = fallbackItems.find((candidate) => candidate.id === id);
    if (!item) {
      return false;
    }

    item.approval_status = "rejected";
    item.approval_reason = reason;
    item.status = "canceled";
    item.updated_at = nowIso();
    return true;
  });
}

export async function syncItemPendingCount() {
  return invokeDesktop("sync_item_pending_count", {}, () =>
    fallbackItems.filter((item) => ["pending", "processing", "failed"].includes(item.status)).length,
  );
}

export async function syncItemListReady({ limit = 50 } = {}) {
  return invokeDesktop("sync_item_list_ready", { limit }, () => {
    return fallbackItems
      .filter((item) => item.status === "pending" && item.approval_status === "approved")
      .sort((a, b) => {
        const priority = (a.priority || 100) - (b.priority || 100);
        if (priority !== 0) return priority;
        return String(a.occurred_at || "").localeCompare(String(b.occurred_at || ""));
      })
      .slice(0, limit);
  });
}

export async function syncItemMarkProcessing(id) {
  return invokeDesktop("sync_item_mark_processing", { id }, () => {
    const item = fallbackItems.find(
      (candidate) =>
        candidate.id === id &&
        ["pending", "failed"].includes(candidate.status) &&
        candidate.approval_status === "approved",
    );
    if (!item) return false;
    item.status = "processing";
    item.attempts = (item.attempts || 0) + 1;
    item.updated_at = nowIso();
    return true;
  });
}

export async function syncItemMarkDone(id, sessionRef = null) {
  return invokeDesktop("sync_item_mark_done", { id, sessionRef }, () => {
    const item = fallbackItems.find((candidate) => candidate.id === id);
    if (!item) return false;
    item.status = "done";
    item.last_error = null;
    if (sessionRef) item.approval_reason = sessionRef;
    item.updated_at = nowIso();
    return true;
  });
}

export async function syncItemMarkFailed(id, lastError = null) {
  return invokeDesktop("sync_item_mark_failed", { id, lastError }, () => {
    const item = fallbackItems.find((candidate) => candidate.id === id);
    if (!item) return false;
    item.status = "failed";
    item.last_error = lastError;
    const backoffSeconds = Math.min(30 * Math.pow(2, Math.max((item.attempts || 1) - 1, 0)), 3600);
    const retryAt = new Date(Date.now() + backoffSeconds * 1000);
    item.retry_at = retryAt.toISOString();
    item.updated_at = nowIso();
    return true;
  });
}
