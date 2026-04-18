/**
 * Hook de balance individual de cuenta bancaria para desktop.
 *
 * En online: fetch desde API → actualiza columna balance en caché de cuentas.
 * En offline: lee balance desde finops_bank_accounts_cache.
 *
 * Task origen: T-1505 (Fase 15 Bloque 2)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { desktopApiClient } from "../../../api/client.js";
import {
  finopsBankAccountsCacheList,
  finopsBankAccountsCacheUpsert,
} from "../../../bridge/finopsCache.bridge.js";

async function fetchBalanceFromApi(bankAccountId) {
  const res = await desktopApiClient.get(`/v1/bank-accounts/${bankAccountId}/balance`);
  return res?.data ?? res;
}

/**
 * @param {string|null} bankAccountId
 * @param {{ isOnline?: boolean, organizationId?: string }} options
 */
export function useAccountBalanceDesktop(bankAccountId, { isOnline = true, organizationId } = {}) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cachedAt, setCachedAt] = useState(null);
  const wasOnlineRef = useRef(isOnline);

  const loadFromCache = useCallback(async () => {
    if (!organizationId) return;
    const rows = await finopsBankAccountsCacheList(organizationId);
    const account = rows.find((a) => a.id === bankAccountId);
    if (account) {
      setBalance(account.balance ?? null);
      setCachedAt(account.syncedAt ?? null);
    }

    setLoading(false);
  }, [bankAccountId, organizationId]);

  const syncFromApi = useCallback(async () => {
    if (!bankAccountId) return;
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchBalanceFromApi(bankAccountId);
      const newBalance = fresh?.balance ?? fresh?.total ?? fresh;
      const syncedAt = new Date().toISOString();

      if (organizationId) {
        const rows = await finopsBankAccountsCacheList(organizationId);
        const existing = rows.find((a) => a.id === bankAccountId);
        if (existing) {
          await finopsBankAccountsCacheUpsert([{ ...existing, balance: newBalance, syncedAt }]);
        }
      }

      setBalance(newBalance);
      setCachedAt(syncedAt);
    } catch (err) {
      await loadFromCache();
      setError(err?.message ?? "Error al obtener balance de la cuenta.");
    } finally {
      setLoading(false);
    }
  }, [bankAccountId, organizationId, loadFromCache]);

  useEffect(() => {
    if (!bankAccountId) return;

    if (isOnline) {
      syncFromApi();
    } else {
      loadFromCache();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankAccountId]);

  useEffect(() => {
    const wasOffline = !wasOnlineRef.current;
    wasOnlineRef.current = isOnline;
    if (isOnline && wasOffline) {
      syncFromApi();
    }
  }, [isOnline, syncFromApi]);

  return {
    balance,
    loading,
    error,
    isOffline: !isOnline,
    cachedAt,
    refetch: syncFromApi,
  };
}
