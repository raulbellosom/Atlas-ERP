/**
 * Handler de sync para financial_transfer.create.
 *
 * Al desencolar: POST /api/v1/transfers con idempotency key.
 * Actualiza finops_transfers_cache: reemplaza id local por id backend,
 * status → PENDING (pendiente de aprobación online).
 *
 * Task origen: T-1508 (Fase 15 Bloque 2)
 */

import { desktopApiClient } from "../../../api/client.js";
import { sqliteExecute } from "../../../bridge/sqlite.bridge.js";

/**
 * @param {{ entity: string, operation: string, payload: object, entityId: string }} item
 */
export async function handleFinopsTransferCreate(item) {
  const dto = item.payload ?? {};
  const localId = item.entityId;

  const res = await desktopApiClient.post("/v1/transfers", dto, {
    headers: { "Idempotency-Key": localId },
  });
  const created = res?.data ?? res;
  const backendId = created?.id ?? created?.data?.id;

  if (!backendId) {
    throw new Error(`[finopsTransferCreateHandler] Backend no retornó id. Payload: ${JSON.stringify(created)}`);
  }

  // Al sincronizar la transferencia queda en PENDING (requiere aprobación online)
  await sqliteExecute(
    `UPDATE finops_transfers_cache
        SET id = ?1, status = 'PENDING', synced_at = ?2
      WHERE id = ?3`,
    [backendId, new Date().toISOString(), localId],
  );

  return { backendId, localId };
}
