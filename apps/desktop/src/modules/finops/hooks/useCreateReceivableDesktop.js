/**
 * Hook de creación de cuenta por cobrar (ReceivableLite) para desktop.
 *
 * - Online: POST /api/v1/receivables-lite directamente.
 * - Offline: UUID local → encola en sync_queue_items → inserta en
 *   finops_cxc_cache con status PENDING_SYNC.
 *
 * Task origen: T-1509 (Fase 15 Bloque 2)
 */

import { useCallback, useState } from "react";
import { desktopApiClient } from "../../../api/client.js";
import { finopsCxcCacheUpsert } from "../../../bridge/finopsCache.bridge.js";
import { enqueueLocalSyncItem } from "../../sync/localSyncEnqueueService.js";

function generateLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useCreateReceivableDesktop({ isOnline = true, organizationId, onSuccess } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const mutate = useCallback(async (dto) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (isOnline) {
        const res = await desktopApiClient.post("/v1/receivables-lite", dto);
        const data = res?.data ?? res;
        setResult(data);
        if (onSuccess) onSuccess(data);
      } else {
        const localId = generateLocalId();
        const occurredAt = new Date().toISOString();

        await enqueueLocalSyncItem({
          entity: "receivable",
          entityId: localId,
          operation: "create",
          payload: { ...dto, localId },
          source: "desktop",
          occurredAt,
        });

        const cacheRow = {
          id: localId,
          organizationId: organizationId ?? dto.organizationId ?? "",
          counterparty: dto.counterparty ?? null,
          amount: dto.amount,
          currency: dto.currency ?? "MXN",
          dueDate: dto.dueDate ?? null,
          status: "PENDING_SYNC",
          syncedAt: occurredAt,
        };

        await finopsCxcCacheUpsert([cacheRow]);

        const offlineResult = { ...cacheRow, _offline: true };
        setResult(offlineResult);
        if (onSuccess) onSuccess(offlineResult);
      }
    } catch (err) {
      setError(err?.message ?? "Error al crear cuenta por cobrar.");
    } finally {
      setLoading(false);
    }
  }, [isOnline, organizationId, onSuccess]);

  return { mutate, loading, error, result };
}
