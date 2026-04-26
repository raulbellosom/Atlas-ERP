const SYNC_QUEUE_STATES = Object.freeze([
  "pending",
  "processing",
  "failed",
  "conflicted",
  "done",
  "canceled",
]);

const SYNC_QUEUE_POLICY = Object.freeze({
  ordering: "fifo_by_occurred_at",
  maxBatchSize: 100,
  lockTimeoutMs: 30_000,
  recoveryOnRestart: true,
  persistQueueInSqlite: true,
});

const SYNC_QUEUE_TRANSITIONS = Object.freeze({
  pending: Object.freeze(["processing", "canceled"]),
  processing: Object.freeze(["done", "failed", "conflicted"]),
  failed: Object.freeze(["pending", "canceled"]),
  conflicted: Object.freeze(["done", "canceled"]),
  done: Object.freeze([]),
  canceled: Object.freeze([]),
});

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSyncQueueState(value) {
  return typeof value === "string" && SYNC_QUEUE_STATES.includes(value);
}

/**
 * @param {string} fromState
 * @param {string} toState
 * @returns {boolean}
 */
function canTransitionQueueState(fromState, toState) {
  if (!isSyncQueueState(fromState) || !isSyncQueueState(toState)) {
    return false;
  }

  return SYNC_QUEUE_TRANSITIONS[fromState].includes(toState);
}

/**
 * @param {Array<object>} items
 * @param {number} maxBatchSize
 * @returns {Array<object>}
 */
function pickQueueBatch(items, maxBatchSize = SYNC_QUEUE_POLICY.maxBatchSize) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const sorted = [...items].sort((a, b) => {
    const aDate = Date.parse(a?.occurredAt ?? "");
    const bDate = Date.parse(b?.occurredAt ?? "");

    return aDate - bDate;
  });

  return sorted.slice(0, maxBatchSize);
}

module.exports = {
  SYNC_QUEUE_POLICY,
  SYNC_QUEUE_STATES,
  canTransitionQueueState,
  isSyncQueueState,
  pickQueueBatch,
};
