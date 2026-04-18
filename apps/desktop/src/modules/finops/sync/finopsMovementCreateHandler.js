/**
 * Handler de sync para financial_movement.create.
 *
 * Al desencolar un item de tipo financial_movement/create:
 *   1. Llama POST /api/v1/financial-movements con el payload.
 *   2. Actualiza finops_movements_cache: reemplaza el id local con el id del backend
 *      y cambia status a SYNCED.
 *
 * Se registra en SyncCore bajo la clave 'financial_movement.create'.
 *
 * Task origen: T-1507 (Fase 15 Bloque 2)
 */

import { desktopApiClient } from "../../../api/client.js";
import { sqliteExecute } from "../../../bridge/sqlite.bridge.js";

/**
 * @param {{ entity: string, operation: string, payload: object, entityId: string }} item
 */
export async function handleFinopsMovementCreate(item) {
  const dto = item.payload ?? {};
  const localId = item.entityId;

  // POST al backend con idempotency key derivada del UUID local
  const res = await desktopApiClient.post("/v1/financial-movements", dto, {
    headers: { "Idempotency-Key": localId },
  });
  const created = res?.data ?? res;
  const backendId = created?.id ?? created?.data?.id;

  if (!backendId) {
    throw new Error(`[finopsMovementCreateHandler] Backend no retornó id. Payload: ${JSON.stringify(created)}`);
  }

  // Actualizar caché local: reemplazar id local por id del backend, marcar SYNCED
  await sqliteExecute(
    `UPDATE finops_movements_cache
        SET id = ?1, status = 'SYNCED', synced_at = ?2
      WHERE id = ?3`,
    [backendId, new Date().toISOString(), localId],
  );

  return { backendId, localId };
}
