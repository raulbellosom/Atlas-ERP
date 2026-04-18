/**
 * Hook de creación de movimiento financiero para desktop.
 *
 * - Online: POST /api/v1/financial-movements directamente.
 * - Offline: genera UUID local → encola en sync_queue_items → inserta
 *   en finops_movements_cache con status PENDING_SYNC.
 *
 * Retorna { mutate, loading, error, result } con interfaz idéntica
 * en ambos modos para que el formulario no necesite bifurcar.
 *
 * Task origen: T-1507 (Fase 15 Bloque 2)
 */

import { useCallback, useState } from "react";
import { desktopApiClient } from "../../../api/client.js";
import { finopsMovementsCacheUpsert } from "../../../bridge/finopsCache.bridge.js";
import { enqueueLocalSyncItem } from "../../sync/localSyncEnqueueService.js";

function generateLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useCreateMovementDesktop({ isOnline = true, onSuccess } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const mutate = useCallback(async (dto) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (isOnline) {
        // Modo online: llamada directa al API
        const res = await desktopApiClient.post("/v1/financial-movements", dto);
        const data = res?.data ?? res;
        setResult(data);
        if (onSuccess) onSuccess(data);
      } else {
        // Modo offline: encolar y reflejar en caché
        const localId = generateLocalId();
        const occurredAt = new Date().toISOString();

        await enqueueLocalSyncItem({
          entity: "financial_movement",
          entityId: localId,
          operation: "create",
          payload: { ...dto, localId },
          source: "desktop",
          occurredAt,
        });

        const cacheRow = {
          id: localId,
          bankAccountId: dto.bankAccountId ?? "__all__",
          amount: dto.amount,
          currency: dto.currency ?? "MXN",
          type: dto.type ?? null,
          status: "PENDING_SYNC",
          movementDate: dto.movementDate ?? occurredAt.slice(0, 10),
          description: dto.description ?? null,
          syncedAt: occurredAt,
        };

        await finopsMovementsCacheUpsert([cacheRow]);

        const offlineResult = { ...cacheRow, _offline: true };
        setResult(offlineResult);
        if (onSuccess) onSuccess(offlineResult);
      }
    } catch (err) {
      setError(err?.message ?? "Error al crear movimiento.");
    } finally {
      setLoading(false);
    }
  }, [isOnline, onSuccess]);

  return { mutate, loading, error, result };
}
