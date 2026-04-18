/**
 * Hook de balance summary para desktop con soporte offline.
 *
 * Retorna el saldo consolidado por organización desde caché SQLite
 * cuando offline. Muestra timestamp del último sync y advertencia
 * si el dato tiene más de 24 horas.
 *
 * Task origen: T-1505 (Fase 15 Bloque 2)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { desktopApiClient } from "../../../api/client.js";
import {
  finopsBalanceSummaryCacheGet,
  finopsBalanceSummaryCacheUpsert,
} from "../../../bridge/finopsCache.bridge.js";
import { FINOPS_CACHE_TTL_MS } from "../offline-contract.js";

const CACHE_TTL_MS = FINOPS_CACHE_TTL_MS.balance_summary;
const STALE_WARNING_MS = 24 * 60 * 60 * 1000; // 24 horas

function isCacheStale(cachedAt) {
  if (!cachedAt) return true;
  return Date.now() - new Date(cachedAt).getTime() > CACHE_TTL_MS;
}

function isCacheVeryStale(cachedAt) {
  if (!cachedAt) return true;
  return Date.now() - new Date(cachedAt).getTime() > STALE_WARNING_MS;
}

async function fetchSummaryFromApi(organizationId, currency) {
  const res = await desktopApiClient.get(`/v1/bank-accounts/organization/${organizationId}/balance-summary`, {
    params: { currency },
  });
  return res?.data ?? res;
}

/**
 * @param {string} organizationId
 * @param {{ isOnline?: boolean, currency?: string }} options
 */
export function useBalanceSummaryDesktop(organizationId, { isOnline = true, currency = "MXN" } = {}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wasOnlineRef = useRef(isOnline);

  const loadFromCache = useCallback(async () => {
    const cached = await finopsBalanceSummaryCacheGet(organizationId, currency);
    setSummary(cached ?? null);
    setLoading(false);
  }, [organizationId, currency]);

  const syncFromApi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchSummaryFromApi(organizationId, currency);
      const cachedAt = new Date().toISOString();
      const row = {
        organizationId,
        currency,
        total: fresh?.total ?? 0,
        activeAccounts: fresh?.activeAccounts ?? fresh?.active_accounts ?? 0,
        cachedAt,
      };
      await finopsBalanceSummaryCacheUpsert(row);
      setSummary(row);
    } catch (err) {
      await loadFromCache();
      setError(err?.message ?? "Error al obtener balance del servidor.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, currency, loadFromCache]);

  useEffect(() => {
    if (!organizationId) return;

    async function init() {
      setLoading(true);
      try {
        const cached = await finopsBalanceSummaryCacheGet(organizationId, currency);
        if (isOnline && isCacheStale(cached?.cachedAt)) {
          await syncFromApi();
        } else {
          setSummary(cached ?? null);
          setLoading(false);
        }
      } catch (err) {
        setError(err?.message ?? "Error durante inicialización de balance.");
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, currency]);

  useEffect(() => {
    const wasOffline = !wasOnlineRef.current;
    wasOnlineRef.current = isOnline;
    if (isOnline && wasOffline) {
      syncFromApi();
    }
  }, [isOnline, syncFromApi]);

  const isStaleWarning = isCacheVeryStale(summary?.cachedAt);

  return {
    summary,
    loading,
    error,
    isOffline: !isOnline,
    cachedAt: summary?.cachedAt ?? null,
    isStaleWarning: !isOnline && isStaleWarning,
    refetch: syncFromApi,
  };
}
