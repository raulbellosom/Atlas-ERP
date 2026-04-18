/**
 * Hook de recuperación de cola FinOps tras reinicio de la app.
 *
 * Al montar:
 *   - Resetea ítems en estado 'processing' → 'pending' (quedaron a medias al cerrar).
 *   - Cuenta los ítems pendientes de sync para mostrar notificación.
 *
 * Emite un flag `hasRecovery` que el layout usa para abrir el panel automáticamente.
 *
 * Task origen: T-1511 (Fase 15 Bloque 3)
 */

import { useEffect, useState } from "react";
import { sqliteExecute, sqliteQuery } from "../../../bridge/sqlite.bridge.js";

const FINOPS_ENTITIES = ["financial_movement", "financial_transfer", "receivable", "payable"];
const ENTITIES_PLACEHOLDER = FINOPS_ENTITIES.map((_, i) => `?${i + 1}`).join(",");

async function recoverFinOpsQueue() {
  const now = new Date().toISOString();

  // Resetear ítems que quedaron en 'processing' al cerrar la app
  await sqliteExecute(
    `UPDATE sync_queue_items
        SET status = 'pending', updated_at = ?1
      WHERE entity IN (${ENTITIES_PLACEHOLDER})
        AND status = 'processing'`,
    [now, ...FINOPS_ENTITIES],
  );

  // Contar ítems que necesitan atención
  const rows = await sqliteQuery(
    `SELECT COUNT(*) AS total
       FROM sync_queue_items
      WHERE entity IN (${ENTITIES_PLACEHOLDER})
        AND status IN ('pending', 'failed')`,
    FINOPS_ENTITIES,
  );

  return rows[0]?.total ?? 0;
}

export function useFinOpsBootRecovery() {
  const [recoveredCount, setRecoveredCount] = useState(0);
  const [hasRecovery, setHasRecovery] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    recoverFinOpsQueue()
      .then((count) => {
        setRecoveredCount(count);
        setHasRecovery(count > 0);
      })
      .catch(() => {})
      .finally(() => setDone(true));
  }, []);

  return { recoveredCount, hasRecovery, done };
}
