const crypto = require("node:crypto");

const SYNC_IDEMPOTENCY_POLICY = Object.freeze({
  algorithm: "sha256",
  separator: "::",
  requiredFields: Object.freeze(["clientId", "entity", "entityId", "operation", "occurredAt"]),
  ttlHours: 72,
});

/**
 * @param {object} params
 * @returns {string}
 */
function buildIdempotencyKey(params = {}) {
  const raw = [
    params.clientId ?? "",
    params.entity ?? "",
    params.entityId ?? "",
    params.operation ?? "",
    params.occurredAt ?? "",
  ].join(SYNC_IDEMPOTENCY_POLICY.separator);

  return crypto.createHash(SYNC_IDEMPOTENCY_POLICY.algorithm).update(raw).digest("hex");
}

/**
 * @param {unknown} key
 * @returns {boolean}
 */
function isValidIdempotencyKey(key) {
  return typeof key === "string" && /^[a-f0-9]{64}$/.test(key);
}

/**
 * @param {Date} createdAt
 * @param {Date} now
 * @returns {boolean}
 */
function isIdempotencyKeyExpired(createdAt, now = new Date()) {
  if (!(createdAt instanceof Date) || Number.isNaN(createdAt.getTime())) {
    return true;
  }

  const ttlMs = SYNC_IDEMPOTENCY_POLICY.ttlHours * 60 * 60 * 1000;

  return now.getTime() - createdAt.getTime() > ttlMs;
}

module.exports = {
  SYNC_IDEMPOTENCY_POLICY,
  buildIdempotencyKey,
  isIdempotencyKeyExpired,
  isValidIdempotencyKey,
};
