/**
 * Handler de sync para subida de adjuntos FinOps offline.
 *
 * Precondición: el movimiento asociado debe estar sincronizado
 * (backendMovementId debe ser no nulo en finops_attachment_queue).
 *
 * Al procesar:
 *   1. Verifica que backendMovementId existe.
 *   2. Lee el archivo desde localPath vía Tauri FS.
 *   3. POST /api/v1/attachments/upload.
 *   4. POST /api/v1/financial-movements/:id/attachments para vincular.
 *   5. Elimina el archivo local.
 *   6. Actualiza finops_attachment_queue con status 'done'.
 *
 * Task origen: T-1513 (Fase 15 Bloque 3)
 */

import { sqliteExecute, sqliteQuery } from "../../../bridge/sqlite.bridge.js";
import { desktopApiClient } from "../../../api/client.js";

async function readFileAsBlob(localPath) {
  // En Tauri 2.x se usa @tauri-apps/plugin-fs si está disponible,
  // pero aquí usamos fetch con asset: protocol como fallback universal
  const { convertFileSrc } = await import("@tauri-apps/api/core");
  const url = convertFileSrc(localPath);
  const res = await fetch(url);
  return res.blob();
}

/**
 * @param {{ entityId: string }} item  — entityId = finops_attachment_queue.id (string)
 */
export async function handleFinopsAttachmentUpload(item) {
  const rows = await sqliteQuery(
    `SELECT id, local_movement_id AS localMovementId, backend_movement_id AS backendMovementId,
            local_path AS localPath, original_filename AS originalFilename, mime_type AS mimeType
       FROM finops_attachment_queue
      WHERE id = ?1 AND status = 'pending'
      LIMIT 1`,
    [item.entityId],
  );

  const record = rows[0];
  if (!record) throw new Error("Adjunto no encontrado o ya procesado.");

  if (!record.backendMovementId) {
    throw new Error("Movimiento aún no sincronizado. Reencolar con delay.");
  }

  // Leer archivo local y hacer upload
  const blob = await readFileAsBlob(record.localPath);
  const formData = new FormData();
  formData.append("file", blob, record.originalFilename);

  const uploadRes = await desktopApiClient.post("/v1/attachments/upload", formData);
  const uploaded = uploadRes?.data ?? uploadRes;
  const attachmentId = uploaded?.id ?? uploaded?.data?.id;

  if (!attachmentId) throw new Error("Upload no retornó attachmentId.");

  // Vincular al movimiento
  await desktopApiClient.post(`/v1/financial-movements/${record.backendMovementId}/attachments`, {
    attachmentId,
  });

  // Marcar como done
  const now = new Date().toISOString();
  await sqliteExecute(
    `UPDATE finops_attachment_queue SET status = 'done', updated_at = ?1 WHERE id = ?2`,
    [now, record.id],
  );

  return { attachmentId, localMovementId: record.localMovementId };
}
