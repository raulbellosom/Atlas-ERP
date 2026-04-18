/**
 * Hook de creación de transferencia bancaria para desktop.
 *
 * - Online: POST /api/v1/transfers directamente.
 * - Offline: UUID local → encola en sync_queue_items → inserta en
 *   finops_transfers_cache con status PENDING_SYNC.
 *
 * La transferencia offline NO puede aprobarse offline (T-1501).
 * Al sincronizar queda en status PENDING esperando aprobación online.
 *
 * Task origen: T-1508 (Fase 15 Bloque 2)
 */

import { useCallback, useState } from "react";
import { desktopApiClient } from "../../../api/client.js";
import { finopsTransfersCacheUpsert } from "../../../bridge/finopsCache.bridge.js";
import { enqueueLocalSyncItem } from "../../sync/localSyncEnqueueService.js";

function generateLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useCreateTransferDesktop({ isOnline = true, onSuccess } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const mutate = useCallback(async (dto) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (isOnline) {
        const res = await desktopApiClient.post("/v1/transfers", dto);
        const data = res?.data ?? res;
        setResult(data);
        if (onSuccess) onSuccess(data);
      } else {
        const localId = generateLocalId();
        const occurredAt = new Date().toISOString();

        await enqueueLocalSyncItem({
          entity: "financial_transfer",
          entityId: localId,
          operation: "create",
          payload: { ...dto, localId },
          source: "desktop",
          occurredAt,
        });

        const cacheRow = {
          id: localId,
          fromAccountId: dto.fromAccountId,
          toAccountId: dto.toAccountId,
          amount: dto.amount,
          currency: dto.currency ?? "MXN",
          status: "PENDING_SYNC",
          transferDate: dto.transferDate ?? occurredAt.slice(0, 10),
          syncedAt: occurredAt,
        };

        await finopsTransfersCacheUpsert([cacheRow]);

        const offlineResult = { ...cacheRow, _offline: true };
        setResult(offlineResult);
        if (onSuccess) onSuccess(offlineResult);
      }
    } catch (err) {
      setError(err?.message ?? "Error al crear transferencia.");
    } finally {
      setLoading(false);
    }
  }, [isOnline, onSuccess]);

  return { mutate, loading, error, result };
}
