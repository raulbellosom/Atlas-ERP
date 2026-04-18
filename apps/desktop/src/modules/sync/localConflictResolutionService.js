import {
  approveSyncItem,
  createSyncItem,
  rejectSyncItem,
} from "./localSyncItemsRepository.js";
import { resolveBackendConflict } from "./syncConflictApi.js";

export const CONFLICT_ACTIONS = Object.freeze({
  APPROVE_LOCAL: "APPROVE_LOCAL",
  KEEP_SERVER: "KEEP_SERVER",
  DISCARD_LOCAL: "DISCARD_LOCAL",
  MERGE_MANUAL: "MERGE_MANUAL",
});

function parsePayloadJson(payloadJson) {
  if (typeof payloadJson !== "string" || payloadJson.trim().length === 0) {
    return {};
  }

  try {
    return JSON.parse(payloadJson);
  } catch {
    return {};
  }
}

function extractConflictId(lastError) {
  if (typeof lastError !== "string" || lastError.trim().length === 0) {
    return null;
  }

  const match = lastError.match(/conflictId=([A-Za-z0-9_-]+)/i);
  return match?.[1] ?? null;
}

function buildResolutionReason(action, reason) {
  if (typeof reason === "string" && reason.trim().length > 0) {
    return reason.trim();
  }

  if (action === CONFLICT_ACTIONS.APPROVE_LOCAL) {
    return "Conflicto resuelto con APPROVE_LOCAL desde Sync Center desktop.";
  }
  if (action === CONFLICT_ACTIONS.KEEP_SERVER) {
    return "Conflicto resuelto con KEEP_SERVER desde Sync Center desktop.";
  }
  if (action === CONFLICT_ACTIONS.DISCARD_LOCAL) {
    return "Conflicto resuelto con DISCARD_LOCAL desde Sync Center desktop.";
  }
  return "Conflicto resuelto con MERGE_MANUAL desde Sync Center desktop.";
}

function buildReplacementIdentifiers(item) {
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const baseItemId = item?.itemId || `sync_item_${item?.id || "unknown"}`;
  const baseIdempotency = item?.idempotencyKey || `ik_conflict_${item?.id || "unknown"}`;

  return {
    itemId: `${baseItemId}_retry_${suffix}`,
    idempotencyKey: `${baseIdempotency}_retry_${suffix}`,
  };
}

async function createReplacementPendingItem({
  item,
  payloadObject,
  resolutionReason,
  action,
}) {
  const identifiers = buildReplacementIdentifiers(item);
  const payloadJson = JSON.stringify(payloadObject ?? {});

  const newId = await createSyncItem({
    itemId: identifiers.itemId,
    entity: item.entity,
    entityId: item.entityId,
    operation: item.operation,
    payloadJson,
    source: item.source ?? "desktop",
    occurredAt: new Date().toISOString(),
    idempotencyKey: identifiers.idempotencyKey,
    fingerprint: item.fingerprint ?? null,
    priority: item.priority ?? 100,
    approvalStatus: "approved",
    approvalReason: resolutionReason,
  });

  await approveSyncItem(newId, resolutionReason);
  await rejectSyncItem(
    item.id,
    `${resolutionReason} Se reemplazó por item ${newId} (${action}).`,
  );

  return { newSyncItemId: newId };
}

async function resolveInBackendIfPossible(item, action, reason) {
  const conflictId = extractConflictId(item?.lastError);
  if (!conflictId) {
    return { sent: false, reason: "missing_conflict_id" };
  }

  return resolveBackendConflict({
    conflictId,
    action,
    reason,
  });
}

export function isConflictCandidate(item) {
  if (!item) {
    return false;
  }

  if (typeof item.lastError !== "string") {
    return false;
  }

  return item.lastError.toLowerCase().includes("conflict");
}

export async function resolveSyncConflictAction({
  item,
  action,
  reason = null,
  mergedPayload = null,
}) {
  if (!item?.id) {
    throw new Error("No se pudo resolver el conflicto: item inválido.");
  }

  if (!isConflictCandidate(item)) {
    throw new Error("El item seleccionado no está marcado como conflicto.");
  }

  const resolutionReason = buildResolutionReason(action, reason);
  let localResult;

  if (action === CONFLICT_ACTIONS.APPROVE_LOCAL) {
    localResult = await createReplacementPendingItem({
      item,
      payloadObject: parsePayloadJson(item.payloadJson),
      resolutionReason,
      action,
    });
  } else if (action === CONFLICT_ACTIONS.MERGE_MANUAL) {
    if (!mergedPayload || typeof mergedPayload !== "object") {
      throw new Error("Para MERGE_MANUAL debes enviar un payload JSON válido.");
    }
    localResult = await createReplacementPendingItem({
      item,
      payloadObject: mergedPayload,
      resolutionReason,
      action,
    });
  } else if (
    action === CONFLICT_ACTIONS.KEEP_SERVER ||
    action === CONFLICT_ACTIONS.DISCARD_LOCAL
  ) {
    await rejectSyncItem(item.id, resolutionReason);
    localResult = { canceledSyncItemId: item.id };
  } else {
    throw new Error(`Acción de resolución no soportada: ${action}`);
  }

  const backendResult = await resolveInBackendIfPossible(item, action, resolutionReason);
  return { action, localResult, backendResult };
}

