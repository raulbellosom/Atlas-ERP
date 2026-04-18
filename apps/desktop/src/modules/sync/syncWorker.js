import { dequeueReadyItems } from "./localSyncDequeueService.js";
import {
  markSyncItemDone,
  markSyncItemFailed,
} from "./localSyncItemsRepository.js";
import { getDesktopNetworkStatus } from "../../bridge/network.bridge.js";
import { env } from "../../config/env.js";

/**
 * Estado compartido del worker.
 * Singleton de modulo — no usar en multiples instancias.
 */
let _isSyncing = false;
let _lastSyncAt = null;
let _lastError = null;

export function evaluateSyncPreconditions({
  isSyncing,
  networkOnline,
  hasAccessToken,
}) {
  if (isSyncing) {
    return { shouldRun: false, reason: "sync_in_progress" };
  }

  if (!networkOnline) {
    return { shouldRun: false, reason: "offline" };
  }

  if (!hasAccessToken) {
    return { shouldRun: false, reason: "no_token" };
  }

  return { shouldRun: true };
}

export function summarizeBatchResults(results = []) {
  return results.reduce(
    (acc, item) => {
      if (item.status === "synced" || item.status === "idempotent") {
        acc.synced += 1;
      } else {
        acc.failed += 1;
      }
      return acc;
    },
    { synced: 0, failed: 0 },
  );
}

/**
 * URL del endpoint de sync batch en el backend.
 */
function getSyncBatchUrl() {
  return `${env.apiUrl}/v1/sync/batch`;
}

/**
 * Lee el access token desde localStorage (igual que el cliente web).
 * Evita importar el store de Zustand para no crear dependencia circular.
 */
function readAccessToken() {
  try {
    const raw = localStorage.getItem("atlas-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Envia un batch de items al backend.
 * Retorna el resultado del servidor con resultados por item.
 *
 * @param {object[]} items — items procesables del dequeue
 * @param {string} accessToken
 * @returns {Promise<{ sessionId: string, results: Array<{itemId: string, status: string, message?: string}> }>}
 */
async function postBatchToBackend(items, accessToken) {
  const body = {
    items: items.map((item) => ({
      itemId: item.itemId,
      entity: item.entity,
      entityId: item.entityId,
      operation: item.operation,
      payload: (() => {
        try {
          return JSON.parse(item.payloadJson);
        } catch {
          return {};
        }
      })(),
      idempotencyKey: item.idempotencyKey,
      fingerprint: item.fingerprint,
      occurredAt: item.occurredAt,
      source: item.source ?? "desktop",
    })),
  };

  const response = await fetch(getSyncBatchUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Backend sync batch respondio ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Procesa los resultados del backend y actualiza el estado local de cada item.
 *
 * @param {object[]} items — items enviados (con id y itemId)
 * @param {Array<{itemId: string, status: string, message?: string}>} results — resultados del backend
 * @param {string} sessionId — ID de la sesion de sync creada en el backend
 */
async function applyBatchResults(items, results, sessionId) {
  const resultMap = new Map(results.map((r) => [r.itemId, r]));

  for (const item of items) {
    const result = resultMap.get(item.itemId);

    if (!result) {
      // Sin resultado del backend para este item — marcarlo como fallido
      await markSyncItemFailed(item.id, "Sin resultado del backend para este item.").catch(() => {});
      continue;
    }

    if (result.status === "synced" || result.status === "idempotent") {
      await markSyncItemDone(item.id, sessionId).catch(() => {});
    } else {
      const conflictSuffix = result.conflictId
        ? ` [conflictId=${result.conflictId}]`
        : "";
      const errorMsg = `${result.message ?? `Backend sync status: ${result.status}`}${conflictSuffix}`;
      await markSyncItemFailed(item.id, errorMsg).catch(() => {});
    }
  }
}

/**
 * Ejecuta un ciclo completo de sincronizacion.
 *
 * 1. Verifica que no haya un ciclo en curso.
 * 2. Verifica conectividad.
 * 3. Hace dequeue de items aprobados y listos.
 * 4. Envia al backend en batch.
 * 5. Aplica resultados localmente.
 *
 * @returns {Promise<{ skipped: boolean, reason?: string, synced: number, failed: number }>}
 */
export async function runSyncCycle() {
  let networkStatus;
  try {
    networkStatus = await getDesktopNetworkStatus();
  } catch {
    networkStatus = { online: navigator.onLine };
  }

  if (!networkStatus.online) {
    return { skipped: true, reason: "offline" };
  }

  const accessToken = readAccessToken();
  const preconditions = evaluateSyncPreconditions({
    isSyncing: _isSyncing,
    networkOnline: Boolean(networkStatus?.online),
    hasAccessToken: Boolean(accessToken),
  });

  if (!preconditions.shouldRun) {
    return { skipped: true, reason: preconditions.reason };
  }

  _isSyncing = true;
  _lastError = null;

  let synced = 0;
  let failed = 0;

  try {
    const items = await dequeueReadyItems({ batchSize: 30 });

    if (items.length === 0) {
      return { skipped: false, synced: 0, failed: 0, empty: true };
    }

    const { sessionId, results } = await postBatchToBackend(items, accessToken);
    await applyBatchResults(items, results, sessionId);

    const summary = summarizeBatchResults(results);
    synced = summary.synced;
    failed = summary.failed;

    _lastSyncAt = new Date().toISOString();

    return { skipped: false, synced, failed };
  } catch (err) {
    _lastError = err instanceof Error ? err.message : String(err);
    return { skipped: false, synced, failed, error: _lastError };
  } finally {
    _isSyncing = false;
  }
}

export function getSyncWorkerStatus() {
  return {
    isSyncing: _isSyncing,
    lastSyncAt: _lastSyncAt,
    lastError: _lastError,
  };
}
