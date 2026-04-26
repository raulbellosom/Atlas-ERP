import {
  approveSyncItem,
  createSyncItem,
  findSyncItemByIdempotencyKey,
  rejectSyncItem,
} from "./localSyncItemsRepository.js";

const OFFLINE_RULES = Object.freeze({
  setting: Object.freeze({ allowOffline: true, operations: Object.freeze(["create", "update", "upsert"]) }),
  feature_flag: Object.freeze({ allowOffline: true, operations: Object.freeze(["create", "update", "upsert"]) }),
  attachment: Object.freeze({ allowOffline: true, operations: Object.freeze(["create", "update"]) }),
  device_registry: Object.freeze({ allowOffline: true, operations: Object.freeze(["create", "update", "upsert"]) }),
  financial_movement: Object.freeze({ allowOffline: true, operations: Object.freeze(["create", "update"]) }),
  financial_transfer: Object.freeze({ allowOffline: true, operations: Object.freeze(["create"]) }),
  receivable: Object.freeze({ allowOffline: true, operations: Object.freeze(["create"]) }),
  payable: Object.freeze({ allowOffline: true, operations: Object.freeze(["create"]) }),
});

const MANUAL_REVIEW_ENTITIES = Object.freeze([
  "financial_account",
  "financial_movement",
  "financial_transfer",
  "receivable",
  "payable",
  "attachment",
]);

function getOfflineRule(entity) {
  return OFFLINE_RULES[entity] || null;
}

function canEntityOperateOffline(entity, operation) {
  const rule = getOfflineRule(entity);
  if (!rule || !rule.allowOffline) {
    return {
      allowed: false,
      reason: `Entidad '${entity}' no permitida offline.`,
    };
  }

  if (!rule.operations.includes(operation)) {
    return {
      allowed: false,
      reason: `Operación '${operation}' no permitida offline para '${entity}'.`,
    };
  }

  return {
    allowed: true,
    reason: "OK",
  };
}

function resolveApprovalStatus(entity, conflictType = null) {
  if (MANUAL_REVIEW_ENTITIES.includes(entity)) {
    return "pending_review";
  }

  if (typeof conflictType === "string" && conflictType.trim().length > 0) {
    return "pending_review";
  }

  return "approved";
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const keys = Object.keys(value).sort();
  const body = keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",");

  return `{${body}}`;
}

function buildIdempotencyKey({ source, entity, entityId, operation, occurredAt }) {
  const base = [source, entity, entityId, operation, occurredAt].join("::");
  return `ik_${hashString(base)}`;
}

function buildFingerprint({ entity, entityId, operation, payload, occurredAt }) {
  const payloadStable = stableStringify(payload ?? {});
  const base = [entity, entityId, operation, payloadStable, occurredAt].join("::");
  return `fp_${hashString(base)}`;
}

function buildItemId({ entity, entityId, operation, occurredAt }) {
  const entropy = Math.random().toString(36).slice(2, 8);
  const base = `${entity}_${entityId}_${operation}_${occurredAt}_${entropy}`;
  return `si_${hashString(base)}_${Date.now()}`;
}

function normalizePayloadJson(payload) {
  return JSON.stringify(payload ?? {});
}

/**
 * Encola un item local de sync aplicando reglas offline, idempotencia y estrategia de aprobación.
 */
export async function enqueueLocalSyncItem({
  entity,
  entityId,
  operation,
  payload,
  priority = 100,
  source = "desktop",
  occurredAt = new Date().toISOString(),
  conflictType = null,
}) {
  if (!entity || !entityId || !operation) {
    throw new Error("entity, entityId y operation son obligatorios para enqueue local.");
  }

  const offlineValidation = canEntityOperateOffline(entity, operation);
  if (!offlineValidation.allowed) {
    return {
      accepted: false,
      blocked: true,
      reason: offlineValidation.reason,
    };
  }

  const idempotencyKey = buildIdempotencyKey({
    source,
    entity,
    entityId,
    operation,
    occurredAt,
  });

  const duplicated = await findSyncItemByIdempotencyKey(idempotencyKey);
  if (duplicated) {
    return {
      accepted: true,
      duplicated: true,
      id: duplicated.id,
      itemId: duplicated.itemId,
      idempotencyKey,
    };
  }

  const approvalStatus = resolveApprovalStatus(entity, conflictType);
  const fingerprint = buildFingerprint({
    entity,
    entityId,
    operation,
    payload,
    occurredAt,
  });
  const itemId = buildItemId({ entity, entityId, operation, occurredAt });

  const id = await createSyncItem({
    itemId,
    entity,
    entityId,
    operation,
    payloadJson: normalizePayloadJson(payload),
    source,
    occurredAt,
    idempotencyKey,
    fingerprint,
    priority,
    approvalStatus,
    approvalReason: approvalStatus === "pending_review" ? "Requiere revisión por política de riesgo." : null,
  });

  if (approvalStatus === "approved") {
    await approveSyncItem(id, "Aprobación automática por política de riesgo bajo.");
  }

  if (approvalStatus === "rejected") {
    await rejectSyncItem(id, "Rechazado por política de aprobación/rechazo.");
  }

  return {
    accepted: approvalStatus !== "rejected",
    duplicated: false,
    id,
    itemId,
    idempotencyKey,
    fingerprint,
    approvalStatus,
  };
}

export function getOfflineRulesCatalog() {
  return OFFLINE_RULES;
}
