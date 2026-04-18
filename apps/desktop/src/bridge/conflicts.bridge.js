import { invokeDesktop } from "./desktopBridge.js";

let fallbackConflictId = 1;
const fallbackConflicts = [];

function nowIso() {
  return new Date().toISOString();
}

export async function syncConflictStore({
  entity,
  entityId,
  localPayloadJson,
  remotePayloadJson,
  reason,
  source = "download",
}) {
  const payload = {
    entity,
    entityId,
    localPayloadJson,
    remotePayloadJson,
    reason,
    source,
  };

  return invokeDesktop("sync_conflict_store", payload, () => {
    const id = fallbackConflictId++;
    const createdAt = nowIso();
    fallbackConflicts.push({
      id,
      entity,
      entityId,
      localPayloadJson,
      remotePayloadJson,
      reason,
      source,
      status: "pending",
      resolution: null,
      mergedPayloadJson: null,
      createdAt,
      updatedAt: createdAt,
    });
    return id;
  });
}

export async function syncConflictList({ status, limit = 200 } = {}) {
  return invokeDesktop("sync_conflict_list", { status, limit }, () => {
    const source = status
      ? fallbackConflicts.filter((item) => item.status === status)
      : [...fallbackConflicts];
    return source.slice(-limit).reverse();
  });
}

export async function syncConflictMarkResolved({
  id,
  resolution,
  mergedPayloadJson = null,
}) {
  const payload = { id, resolution, mergedPayloadJson };
  return invokeDesktop("sync_conflict_mark_resolved", payload, () => {
    const item = fallbackConflicts.find((row) => row.id === id);
    if (!item) {
      return false;
    }
    item.status = "resolved";
    item.resolution = resolution;
    item.mergedPayloadJson = mergedPayloadJson;
    item.updatedAt = nowIso();
    return true;
  });
}

export async function syncConflictPendingCount() {
  return invokeDesktop("sync_conflict_pending_count", {}, () =>
    fallbackConflicts.filter((item) => item.status === "pending").length,
  );
}
