import { env } from "../../config/env.js";

function readAccessToken() {
  try {
    const raw = localStorage.getItem("atlas-auth");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function buildResolveUrl(conflictId) {
  return `${env.apiUrl}/v1/sync/conflicts/${conflictId}/resolve`;
}

/**
 * Intenta resolver un conflicto en backend.
 * Si no existe token/API URL, se considera un no-op controlado.
 */
export async function resolveBackendConflict({ conflictId, action, reason = null }) {
  if (!conflictId || !action || !env.apiUrl) {
    return { sent: false, reason: "missing_context" };
  }

  const accessToken = readAccessToken();
  if (!accessToken) {
    return { sent: false, reason: "missing_token" };
  }

  const response = await fetch(buildResolveUrl(conflictId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-atlas-client": "desktop",
    },
    body: JSON.stringify({
      action,
      reason: reason ?? undefined,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`No fue posible resolver conflicto en backend (${response.status}): ${text}`);
  }

  const payload = await response.json().catch(() => null);
  return { sent: true, payload };
}
