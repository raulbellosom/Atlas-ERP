const crypto = require("node:crypto");

const SYNC_DUPLICATE_POLICY = Object.freeze({
  strategy: "fingerprint_and_idempotency_key",
  fingerprintFields: Object.freeze(["entity", "entityId", "operation", "payload", "occurredAt"]),
  preferIdempotencyKey: true,
});

/**
 * @param {object} item
 * @returns {string}
 */
function createDuplicateFingerprint(item = {}) {
  const payloadString = JSON.stringify(item.payload ?? {});
  const raw = [
    item.entity ?? "",
    item.entityId ?? "",
    item.operation ?? "",
    payloadString,
    item.occurredAt ?? "",
  ].join("::");

  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * @param {object} existingItem
 * @param {object} incomingItem
 * @returns {boolean}
 */
function isDuplicateCandidate(existingItem = {}, incomingItem = {}) {
  if (
    typeof existingItem.idempotencyKey === "string" &&
    typeof incomingItem.idempotencyKey === "string" &&
    existingItem.idempotencyKey.length > 0 &&
    existingItem.idempotencyKey === incomingItem.idempotencyKey
  ) {
    return true;
  }

  return createDuplicateFingerprint(existingItem) === createDuplicateFingerprint(incomingItem);
}

/**
 * @param {Array<object>} items
 * @returns {Array<object>}
 */
function dedupeSyncItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const seen = new Set();

  return items.filter((item) => {
    const key = item?.idempotencyKey || createDuplicateFingerprint(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

module.exports = {
  SYNC_DUPLICATE_POLICY,
  createDuplicateFingerprint,
  dedupeSyncItems,
  isDuplicateCandidate,
};
