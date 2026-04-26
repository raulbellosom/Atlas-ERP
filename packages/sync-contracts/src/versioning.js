const SYNC_PAYLOAD_VERSION_CURRENT = "1.0.0";
const SYNC_PAYLOAD_VERSION_SUPPORTED = Object.freeze([SYNC_PAYLOAD_VERSION_CURRENT]);

const SYNC_VERSION_POLICY = Object.freeze({
  strategy: "semver",
  breaking: "major",
  backwardCompatible: ["minor", "patch"],
  negotiation: "client_declares_version_server_accepts_or_rejects",
});

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSemanticVersion(value) {
  if (typeof value !== "string") {
    return false;
  }

  return /^\d+\.\d+\.\d+$/.test(value);
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSupportedSyncPayloadVersion(value) {
  if (!isSemanticVersion(value)) {
    return false;
  }

  return SYNC_PAYLOAD_VERSION_SUPPORTED.includes(value);
}

module.exports = {
  SYNC_PAYLOAD_VERSION_CURRENT,
  SYNC_PAYLOAD_VERSION_SUPPORTED,
  SYNC_VERSION_POLICY,
  isSemanticVersion,
  isSupportedSyncPayloadVersion,
};
