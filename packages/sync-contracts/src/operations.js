/**
 * Operaciones permitidas en la cola de sincronización.
 */
const SYNC_OPERATION_TYPES = Object.freeze([
  "create",
  "update",
  "upsert",
  "soft_delete",
  "restore",
  "resolve_conflict",
]);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSyncOperationType(value) {
  return typeof value === "string" && SYNC_OPERATION_TYPES.includes(value);
}

module.exports = {
  SYNC_OPERATION_TYPES,
  isSyncOperationType,
};
