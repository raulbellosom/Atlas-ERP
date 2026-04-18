const { SYNC_ENTITY_TYPES, isSyncEntityType } = require("./entities");
const { SYNC_OPERATION_TYPES, isSyncOperationType } = require("./operations");
const {
  SYNC_PAYLOAD_VERSION_CURRENT,
  SYNC_PAYLOAD_VERSION_SUPPORTED,
  SYNC_VERSION_POLICY,
  isSemanticVersion,
  isSupportedSyncPayloadVersion,
} = require("./versioning");
const {
  SYNC_ITEM_SOURCES,
  buildSyncBatchPayload,
  isSyncItemSource,
  validateSyncBatchPayload,
  validateSyncItem,
} = require("./payload");
const {
  SYNC_QUEUE_POLICY,
  SYNC_QUEUE_STATES,
  canTransitionQueueState,
  isSyncQueueState,
  pickQueueBatch,
} = require("./queue");
const { SYNC_RETRY_POLICY, computeRetryDelay, shouldRetryAttempt } = require("./retries");
const {
  SYNC_IDEMPOTENCY_POLICY,
  buildIdempotencyKey,
  isIdempotencyKeyExpired,
  isValidIdempotencyKey,
} = require("./idempotency");
const {
  SYNC_DUPLICATE_POLICY,
  createDuplicateFingerprint,
  dedupeSyncItems,
  isDuplicateCandidate,
} = require("./duplicates");
const {
  SYNC_CONFLICT_POLICY,
  SYNC_CONFLICT_TYPES,
  classifyConflict,
  isSyncConflictType,
  requiresManualConflictResolution,
} = require("./conflicts");
const {
  SYNC_APPROVAL_DECISIONS,
  SYNC_APPROVAL_POLICY,
  isSyncApprovalDecision,
  resolveApprovalDecision,
} = require("./approvals");
const {
  OFFLINE_ENTITY_RULES,
  canOperateOffline,
  getOfflineRuleForEntity,
} = require("./offlineRules");

module.exports = {
  OFFLINE_ENTITY_RULES,
  SYNC_APPROVAL_DECISIONS,
  SYNC_APPROVAL_POLICY,
  SYNC_CONFLICT_POLICY,
  SYNC_CONFLICT_TYPES,
  SYNC_DUPLICATE_POLICY,
  SYNC_ENTITY_TYPES,
  SYNC_IDEMPOTENCY_POLICY,
  SYNC_OPERATION_TYPES,
  SYNC_PAYLOAD_VERSION_CURRENT,
  SYNC_PAYLOAD_VERSION_SUPPORTED,
  SYNC_QUEUE_POLICY,
  SYNC_QUEUE_STATES,
  SYNC_RETRY_POLICY,
  SYNC_VERSION_POLICY,
  SYNC_ITEM_SOURCES,
  buildSyncBatchPayload,
  buildIdempotencyKey,
  canTransitionQueueState,
  classifyConflict,
  canOperateOffline,
  computeRetryDelay,
  createDuplicateFingerprint,
  dedupeSyncItems,
  getOfflineRuleForEntity,
  isSemanticVersion,
  isSyncApprovalDecision,
  isDuplicateCandidate,
  isIdempotencyKeyExpired,
  isSyncConflictType,
  isSupportedSyncPayloadVersion,
  isSyncEntityType,
  isSyncItemSource,
  isSyncOperationType,
  isSyncQueueState,
  isValidIdempotencyKey,
  pickQueueBatch,
  requiresManualConflictResolution,
  resolveApprovalDecision,
  shouldRetryAttempt,
  validateSyncBatchPayload,
  validateSyncItem,
};
