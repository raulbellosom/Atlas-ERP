/**
 * Handler de sync para payable.create.
 *
 * Al desencolar: POST /api/v1/payables-lite con idempotency key.
 * Actualiza finops_cxp_cache: id local → id backend, status → PENDING.
 *
 * Task origen: T-1509 (Fase 15 Bloque 2)
 */

import { desktopApiClient } from "../../../api/client.js";
import { sqliteExecute } from "../../../bridge/sqlite.bridge.js";

export async function handleFinopsPayableCreate(item) {
  const dto = item.payload ?? {};
  const localId = item.entityId;

  const res = await desktopApiClient.post("/v1/payables-lite", dto, {
    headers: { "Idempotency-Key": localId },
  });
  const created = res?.data ?? res;
  const backendId = created?.id ?? created?.data?.id;

  if (!backendId) {
    throw new Error(`[finopsPayableCreateHandler] Backend no retornó id. Payload: ${JSON.stringify(created)}`);
  }

  await sqliteExecute(
    `UPDATE finops_cxp_cache
        SET id = ?1, status = 'PENDING', synced_at = ?2
      WHERE id = ?3`,
    [backendId, new Date().toISOString(), localId],
  );

  return { backendId, localId };
}
