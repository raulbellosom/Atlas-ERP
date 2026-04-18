const { isSyncEntityType } = require("./entities");
const { isSyncOperationType } = require("./operations");
const {
  SYNC_PAYLOAD_VERSION_CURRENT,
  isSupportedSyncPayloadVersion,
} = require("./versioning");

const SYNC_ITEM_SOURCES = Object.freeze(["desktop", "web", "api", "worker"]);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSyncItemSource(value) {
  return typeof value === "string" && SYNC_ITEM_SOURCES.includes(value);
}

/**
 * @param {object} params
 * @returns {object}
 */
function buildSyncBatchPayload(params = {}) {
  const now = new Date().toISOString();
  const items = Array.isArray(params.items) ? params.items : [];

  return {
    version: params.version ?? SYNC_PAYLOAD_VERSION_CURRENT,
    requestId: params.requestId ?? null,
    sentAt: params.sentAt ?? now,
    client: {
      deviceId: params.client?.deviceId ?? null,
      appVersion: params.client?.appVersion ?? null,
      platform: params.client?.platform ?? null,
      organizationId: params.client?.organizationId ?? null,
      branchId: params.client?.branchId ?? null,
      userId: params.client?.userId ?? null,
    },
    batch: {
      totalItems: items.length,
      items,
    },
  };
}

/**
 * @param {object} item
 * @returns {string[]}
 */
function validateSyncItem(item) {
  const errors = [];

  if (!item || typeof item !== "object") {
    return ["item debe ser un objeto"];
  }

  if (!item.itemId || typeof item.itemId !== "string") {
    errors.push("itemId es requerido y debe ser string");
  }

  if (!isSyncEntityType(item.entity)) {
    errors.push("entity no es sincronizable");
  }

  if (!isSyncOperationType(item.operation)) {
    errors.push("operation no es válida para sync");
  }

  if (!item.entityId || typeof item.entityId !== "string") {
    errors.push("entityId es requerido y debe ser string");
  }

  if (!item.idempotencyKey || typeof item.idempotencyKey !== "string") {
    errors.push("idempotencyKey es requerido y debe ser string");
  }

  if (!item.occurredAt || Number.isNaN(Date.parse(item.occurredAt))) {
    errors.push("occurredAt es requerido y debe ser fecha ISO válida");
  }

  if (!isSyncItemSource(item.source)) {
    errors.push("source no es válido");
  }

  if (typeof item.payload !== "object" || item.payload === null) {
    errors.push("payload es requerido y debe ser objeto");
  }

  return errors;
}

/**
 * @param {object} payload
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateSyncBatchPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return {
      valid: false,
      errors: ["payload debe ser un objeto"],
    };
  }

  if (!isSupportedSyncPayloadVersion(payload.version)) {
    errors.push("version de payload no soportada");
  }

  if (!payload.client || typeof payload.client !== "object") {
    errors.push("client es requerido y debe ser objeto");
  }

  if (!payload.batch || typeof payload.batch !== "object") {
    errors.push("batch es requerido y debe ser objeto");
  }

  if (!Array.isArray(payload.batch?.items)) {
    errors.push("batch.items debe ser un arreglo");
  } else {
    payload.batch.items.forEach((item, index) => {
      const itemErrors = validateSyncItem(item);

      itemErrors.forEach((itemError) => {
        errors.push(`batch.items[${index}]: ${itemError}`);
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  SYNC_ITEM_SOURCES,
  buildSyncBatchPayload,
  isSyncItemSource,
  validateSyncBatchPayload,
  validateSyncItem,
};
