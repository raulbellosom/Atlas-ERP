/**
 * Hook de movimientos financieros para desktop con soporte offline.
 *
 * Estrategia:
 *   - Online: fetch API (últimos FINOPS_MOVEMENTS_CACHE_DAYS días) → guarda en SQLite → retorna.
 *   - Offline: lee desde finops_movements_cache local.
 *   - Movimientos creados offline se insertan con status 'PENDING_SYNC' y se muestran con badge.
 *   - Al reconectar se refresca el caché completo desde el servidor.
 *
 * Task origen: T-1504 (Fase 15 Bloque 1)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { desktopApiClient } from "../../../api/client.js";
import {
  finopsMovementsCacheClear,
  finopsMovementsCacheList,
  finopsMovementsCacheUpsert,
} from "../../../bridge/finopsCache.bridge.js";
import { FINOPS_CACHE_TTL_MS, FINOPS_MOVEMENTS_CACHE_DAYS } from "../offline-contract.js";

const CACHE_TTL_MS = FINOPS_CACHE_TTL_MS.movements;

function getCacheFromDate() {
  const d = new Date();
  d.setDate(d.getDate() - FINOPS_MOVEMENTS_CACHE_DAYS);
  return d.toISOString().slice(0, 10);
}

function isCacheStale(syncedAt) {
  if (!syncedAt) return true;
  return Date.now() - new Date(syncedAt).getTime() > CACHE_TTL_MS;
}

async function fetchMovementsFromApi(bankAccountId) {
  const from = getCacheFromDate();
  const params = { from };
  if (bankAccountId) params.bankAccountId = bankAccountId;

  const res = await desktopApiClient.get("/v1/financial-movements", { params });
  const payload = res?.data ?? res;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

/**
 * @param {string|null} bankAccountId  — null para todos los movimientos de la organización
 * @param {{ isOnline?: boolean }} options
 */
export function useFinancialMovementsDesktop(bankAccountId, { isOnline = true } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const wasOnlineRef = useRef(isOnline);

  const loadFromCache = useCallback(async () => {
    try {
      const rows = await finopsMovementsCacheList(bankAccountId ?? "__all__");
      setData(rows);
      setLastSyncedAt(rows[0]?.syncedAt ?? null);
    } catch (err) {
      setError(err?.message ?? "Error al leer caché local de movimientos.");
    }
  }, [bankAccountId]);

  const syncFromApi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const freshData = await fetchMovementsFromApi(bankAccountId);
      const syncedAt = new Date().toISOString();
      const rows = freshData.map((m) => ({
        ...m,
        bankAccountId: m.bankAccountId ?? bankAccountId ?? "__all__",
        syncedAt,
        status: m.status ?? "SYNCED",
      }));

      await finopsMovementsCacheClear(bankAccountId ?? "__all__");
      if (rows.length > 0) {
        await finopsMovementsCacheUpsert(rows);
      }

      setData(rows);
      setLastSyncedAt(syncedAt);
    } catch (err) {
      await loadFromCache();
      setError(err?.message ?? "Error al obtener movimientos del servidor.");
    } finally {
      setLoading(false);
    }
  }, [bankAccountId, loadFromCache]);

  /**
   * Inserta un movimiento creado offline en el caché local con status PENDING_SYNC.
   * Llamar desde T-1507 después de encolar en sync queue.
   */
  const appendOfflineMovement = useCallback(async (movement) => {
    const syncedAt = new Date().toISOString();
    const row = {
      ...movement,
      bankAccountId: movement.bankAccountId ?? bankAccountId ?? "__all__",
      syncedAt,
      status: "PENDING_SYNC",
    };
    await finopsMovementsCacheUpsert([row]);
    setData((prev) => [row, ...prev]);
  }, [bankAccountId]);

  // Carga inicial
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const cached = await finopsMovementsCacheList(bankAccountId ?? "__all__");
        const cachedSyncedAt = cached[0]?.syncedAt ?? null;

        if (isOnline && isCacheStale(cachedSyncedAt)) {
          await syncFromApi();
        } else {
          setData(cached);
          setLastSyncedAt(cachedSyncedAt);
          setLoading(false);
        }
      } catch (err) {
        setError(err?.message ?? "Error durante inicialización de movimientos.");
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankAccountId]);

  // Refresco automático al reconectar
  useEffect(() => {
    const wasOffline = !wasOnlineRef.current;
    wasOnlineRef.current = isOnline;
    if (isOnline && wasOffline) {
      syncFromApi();
    }
  }, [isOnline, syncFromApi]);

  return {
    data,
    loading,
    error,
    isOffline: !isOnline,
    lastSyncedAt,
    refetch: syncFromApi,
    appendOfflineMovement,
  };
}
