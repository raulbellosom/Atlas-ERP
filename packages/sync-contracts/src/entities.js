/**
 * Entidades permitidas para sincronización.
 * La lista es extensible en bloques posteriores de Fase 10.
 */
const SYNC_ENTITY_TYPES = Object.freeze([
  "organization",
  "branch",
  "user",
  "role",
  "permission",
  "user_role",
  "role_permission",
  "setting",
  "feature_flag",
  "attachment",
  "device_registry",
  "financial_account",
  "financial_movement",
  "financial_transfer",
]);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSyncEntityType(value) {
  return typeof value === "string" && SYNC_ENTITY_TYPES.includes(value);
}

module.exports = {
  SYNC_ENTITY_TYPES,
  isSyncEntityType,
};
