const SYNC_CONFLICT_TYPES = Object.freeze([
  "version_mismatch",
  "simultaneous_update",
  "delete_vs_update",
  "invariant_violation",
]);

const SYNC_CONFLICT_POLICY = Object.freeze({
  defaultResolution: "manual_review",
  autoResolveAllowedFor: Object.freeze(["setting", "feature_flag"]),
  sensitiveEntitiesRequireManualReview: Object.freeze([
    "financial_account",
    "financial_movement",
    "financial_transfer",
    "attachment",
  ]),
  allowedResolutions: Object.freeze([
    "keep_local",
    "keep_server",
    "manual_merge",
    "discard_local",
  ]),
});

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSyncConflictType(value) {
  return typeof value === "string" && SYNC_CONFLICT_TYPES.includes(value);
}

/**
 * @param {object} params
 * @returns {string}
 */
function classifyConflict(params = {}) {
  if (params.localDeleted && !params.serverDeleted) {
    return "delete_vs_update";
  }

  if (params.serverVersion && params.localBaseVersion && params.serverVersion !== params.localBaseVersion) {
    return "version_mismatch";
  }

  if (params.localUpdatedAt && params.serverUpdatedAt) {
    return "simultaneous_update";
  }

  return "invariant_violation";
}

/**
 * @param {object} params
 * @returns {boolean}
 */
function requiresManualConflictResolution(params = {}) {
  if (params.entity && SYNC_CONFLICT_POLICY.sensitiveEntitiesRequireManualReview.includes(params.entity)) {
    return true;
  }

  if (params.conflictType && params.conflictType === "invariant_violation") {
    return true;
  }

  return !SYNC_CONFLICT_POLICY.autoResolveAllowedFor.includes(params.entity);
}

module.exports = {
  SYNC_CONFLICT_POLICY,
  SYNC_CONFLICT_TYPES,
  classifyConflict,
  isSyncConflictType,
  requiresManualConflictResolution,
};
