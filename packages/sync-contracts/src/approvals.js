const SYNC_APPROVAL_DECISIONS = Object.freeze(["approved", "rejected", "pending_review"]);

const SYNC_APPROVAL_POLICY = Object.freeze({
  strategy: "risk_based",
  defaultDecision: "pending_review",
  autoApproveEntities: Object.freeze(["setting", "feature_flag", "device_registry"]),
  manualReviewEntities: Object.freeze([
    "financial_account",
    "financial_movement",
    "financial_transfer",
    "attachment",
  ]),
  requiredReviewerRole: "sync:review",
});

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSyncApprovalDecision(value) {
  return typeof value === "string" && SYNC_APPROVAL_DECISIONS.includes(value);
}

/**
 * @param {object} params
 * @param {string} params.entity
 * @param {string | undefined} params.conflictType
 * @returns {"approved" | "rejected" | "pending_review"}
 */
function resolveApprovalDecision(params = {}) {
  const entity = typeof params.entity === "string" ? params.entity : "";
  const hasConflict = typeof params.conflictType === "string" && params.conflictType.length > 0;

  if (SYNC_APPROVAL_POLICY.manualReviewEntities.includes(entity)) {
    return "pending_review";
  }

  if (hasConflict) {
    return "pending_review";
  }

  if (SYNC_APPROVAL_POLICY.autoApproveEntities.includes(entity)) {
    return "approved";
  }

  return SYNC_APPROVAL_POLICY.defaultDecision;
}

module.exports = {
  SYNC_APPROVAL_DECISIONS,
  SYNC_APPROVAL_POLICY,
  isSyncApprovalDecision,
  resolveApprovalDecision,
};
