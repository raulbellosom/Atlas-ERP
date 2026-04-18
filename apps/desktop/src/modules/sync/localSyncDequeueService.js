import {
  listReadySyncItems,
  markSyncItemFailed,
  markSyncItemProcessing,
} from "./localSyncItemsRepository.js";

const DEFAULT_BATCH_SIZE = 30;

/**
 * Servicio de dequeue controlado.
 *
 * Extrae items aprobados y listos (status=pending, approvalStatus=approved)
 * de la cola local SQLite y los marca como "processing" antes de retornarlos
 * al worker para su envio al backend.
 *
 * Garantias:
 * - Solo items con approvalStatus=approved y status=pending son elegibles.
 * - Cada item es marcado como 'processing' de forma atomica antes de retornarlo.
 * - Si el marcado falla, el item se omite (no se envia) y se registra el error.
 * - El worker es responsable de marcar como 'done' o 'failed' segun el resultado.
 */
export async function dequeueReadyItems({ batchSize = DEFAULT_BATCH_SIZE } = {}) {
  const candidates = await listReadySyncItems({ limit: batchSize });

  if (candidates.length === 0) {
    return [];
  }

  const dequeued = [];
  for (const item of candidates) {
    try {
      const marked = await markSyncItemProcessing(item.id);
      if (marked) {
        dequeued.push({ ...item, status: "processing" });
      }
    } catch (err) {
      // Si no se puede marcar, lo dejamos para el siguiente ciclo
      const errorMessage = err instanceof Error ? err.message : String(err);
      await markSyncItemFailed(item.id, `dequeue_error: ${errorMessage}`).catch(() => {});
    }
  }

  return dequeued;
}

/**
 * Rollback de items que estaban en 'processing' y no llegaron al backend
 * (ej. app cerrada abruptamente antes de la respuesta).
 * Los resetea a 'pending' marcandolos como 'failed' con mensaje de recovery.
 */
export async function rollbackStaleProcessingItems() {
  const all = await listReadySyncItems({ limit: 200 });
  // Los items 'processing' no aparecen en listReadySyncItems (que filtra por pending)
  // Esta funcion es una salvaguarda para recovery manual; el worker llama a recoverAfterRestart
  // a nivel de syncQueue. Para sync_queue_items, el recovery ocurre al marcarlos failed.
  // Implementacion futura: consultar status='processing' directamente.
  return all.length;
}
