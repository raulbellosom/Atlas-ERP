import {
  syncConflictList,
  syncConflictMarkResolved,
  syncConflictPendingCount,
  syncConflictStore,
} from "../../bridge/conflicts.bridge.js";

export async function registerDownloadedConflict({
  entity,
  entityId,
  localPayload,
  remotePayload,
  reason,
  source = "download",
}) {
  return syncConflictStore({
    entity,
    entityId,
    localPayloadJson: JSON.stringify(localPayload ?? {}),
    remotePayloadJson: JSON.stringify(remotePayload ?? {}),
    reason,
    source,
  });
}

export async function listPendingConflicts(limit = 100) {
  return syncConflictList({ status: "pending", limit });
}

export async function listAllConflicts(limit = 200) {
  return syncConflictList({ limit });
}

export async function resolveConflict(id, resolution, mergedPayload = null) {
  return syncConflictMarkResolved({
    id,
    resolution,
    mergedPayloadJson: mergedPayload ? JSON.stringify(mergedPayload) : null,
  });
}

export async function countPendingConflicts() {
  return syncConflictPendingCount();
}
