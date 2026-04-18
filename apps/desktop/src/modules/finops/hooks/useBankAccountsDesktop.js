/**
 * Hook de cuentas bancarias para desktop con soporte offline.
 *
 * Estrategia:
 *   - Online: fetch desde API → guarda en caché SQLite → retorna datos frescos.
 *   - Offline: lee desde caché SQLite local.
 *   - Refresco automático al reconectar (online event).
 *   - Refresco automático al montar si caché tiene > TTL (1 hora).
 *
 * Task origen: T-1503 (Fase 15 Bloque 1)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { desktopApiClient } from "../../../api/client.js";
import {
  finopsBankAccountsCacheClear,
  finopsBankAccountsCacheList,
  finopsBankAccountsCacheUpsert,
} from "../../../bridge/finopsCache.bridge.js";
import { FINOPS_CACHE_TTL_MS } from "../offline-contract.js";

const CACHE_TTL_MS = FINOPS_CACHE_TTL_MS.bank_accounts;

async function fetchBankAccountsFromApi(organizationId) {
  const res = await desktopApiClient.get("/v1/bank-accounts", {
    params: { organizationId },
  });
  const payload = res?.data ?? res;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

function isCacheStale(syncedAt) {
  if (!syncedAt) return true;
  const age = Date.now() - new Date(syncedAt).getTime();
  return age > CACHE_TTL_MS;
}

/**
 * @param {string} organizationId
 * @param {{ isOnline?: boolean }} options
 */
export function useBankAccountsDesktop(organizationId, { isOnline = true } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const wasOnlineRef = useRef(isOnline);

  const loadFromCache = useCallback(async () => {
    if (!organizationId) return;
    try {
      const rows = await finopsBankAccountsCacheList(organizationId);
      setData(rows);
      setLastSyncedAt(rows[0]?.syncedAt ?? null);
    } catch (err) {
      setError(err?.message ?? "Error al leer caché local.");
    }
  }, [organizationId]);

  const syncFromApi = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const freshData = await fetchBankAccountsFromApi(organizationId);
      const syncedAt = new Date().toISOString();
      const rows = freshData.map((a) => ({ ...a, syncedAt }));

      await finopsBankAccountsCacheClear(organizationId);
      if (rows.length > 0) {
        await finopsBankAccountsCacheUpsert(rows);
      }

      setData(rows);
      setLastSyncedAt(syncedAt);
    } catch (err) {
      // fetch fallido → intentar servir desde caché
      await loadFromCache();
      setError(err?.message ?? "Error al obtener datos del servidor.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, loadFromCache]);

  // Carga inicial
  useEffect(() => {
    if (!organizationId) return;

    async function init() {
      setLoading(true);
      try {
        const cached = await finopsBankAccountsCacheList(organizationId);
        const cachedSyncedAt = cached[0]?.syncedAt ?? null;

        if (isOnline && isCacheStale(cachedSyncedAt)) {
          // Online y caché vencida → sincronizar
          await syncFromApi();
        } else if (isOnline) {
          // Online y caché vigente → usar caché, refrescar en background si queda poco TTL
          setData(cached);
          setLastSyncedAt(cachedSyncedAt);
          setLoading(false);
        } else {
          // Offline → servir caché
          setData(cached);
          setLastSyncedAt(cachedSyncedAt);
          setLoading(false);
        }
      } catch (err) {
        setError(err?.message ?? "Error durante inicialización.");
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

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
  };
}
