/**
 * Hook de visualización de la cola de sync del módulo FinOps.
 *
 * Lee sync_queue_items filtrando por entidades finops desde SQLite.
 * Se actualiza cuando se invoca refetch() (polling manual o event-driven).
 *
 * Task origen: T-1510 (Fase 15 Bloque 3)
 */

import { useCallback, useEffect, useState } from "react";
import { sqliteQuery } from "../../../bridge/sqlite.bridge.js";

const FINOPS_ENTITIES = ["financial_movement", "financial_transfer", "receivable", "payable"];
const ENTITIES_PLACEHOLDER = FINOPS_ENTITIES.map((_, i) => `?${i + 1}`).join(",");

async function loadFinOpsSyncItems() {
  return sqliteQuery(
    `SELECT id, item_id AS itemId, entity, entity_id AS entityId, operation,
            status, attempts, priority, approval_status AS approvalStatus,
            last_error AS lastError, occurred_at AS occurredAt,
            created_at AS createdAt, updated_at AS updatedAt
       FROM sync_queue_items
      WHERE entity IN (${ENTITIES_PLACEHOLDER})
        AND status NOT IN ('done')
      ORDER BY priority ASC, occurred_at ASC
      LIMIT 200`,
    FINOPS_ENTITIES,
  );
}

export function useFinOpsSyncQueue({ pollIntervalMs = 5000 } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      const rows = await loadFinOpsSyncItems();
      setItems(rows);
    } catch (err) {
      setError(err?.message ?? "Error al leer cola de sync FinOps.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Polling periódico (fallback cuando no hay eventos Tauri)
  useEffect(() => {
    if (!pollIntervalMs) return;
    const interval = setInterval(refetch, pollIntervalMs);
    return () => clearInterval(interval);
  }, [refetch, pollIntervalMs]);

  const pendingCount = items.filter((i) => i.status === "pending" || i.status === "processing").length;
  const errorCount = items.filter((i) => i.status === "failed").length;

  return {
    items,
    loading,
    error,
    pendingCount,
    errorCount,
    refetch,
  };
}
