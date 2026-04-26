const SYNC_RETRY_POLICY = Object.freeze({
  strategy: "exponential_backoff_with_jitter",
  maxAttempts: 5,
  baseDelayMs: 1_000,
  maxDelayMs: 60_000,
  jitterRatio: 0.2,
  retryableStatusCodes: Object.freeze([408, 409, 425, 429, 500, 502, 503, 504]),
  nonRetryableErrorCodes: Object.freeze(["VALIDATION_ERROR", "AUTH_ERROR", "FORBIDDEN"]),
});

/**
 * @param {number} attempt
 * @param {object} policy
 * @returns {number}
 */
function computeRetryDelay(attempt, policy = SYNC_RETRY_POLICY) {
  const safeAttempt = Number.isFinite(attempt) && attempt > 0 ? attempt : 1;
  const expo = policy.baseDelayMs * (2 ** (safeAttempt - 1));
  const capped = Math.min(expo, policy.maxDelayMs);

  if (!policy.jitterRatio || policy.jitterRatio <= 0) {
    return capped;
  }

  const jitter = Math.floor(capped * policy.jitterRatio * Math.random());

  return Math.min(capped + jitter, policy.maxDelayMs);
}

/**
 * @param {object} params
 * @param {number} params.attempt
 * @param {number | undefined} params.statusCode
 * @param {string | undefined} params.errorCode
 * @param {object} policy
 * @returns {boolean}
 */
function shouldRetryAttempt(params, policy = SYNC_RETRY_POLICY) {
  const attempt = Number.isFinite(params?.attempt) ? params.attempt : 1;

  if (attempt >= policy.maxAttempts) {
    return false;
  }

  if (params?.errorCode && policy.nonRetryableErrorCodes.includes(params.errorCode)) {
    return false;
  }

  if (params?.statusCode == null) {
    return true;
  }

  return policy.retryableStatusCodes.includes(params.statusCode);
}

module.exports = {
  SYNC_RETRY_POLICY,
  computeRetryDelay,
  shouldRetryAttempt,
};
