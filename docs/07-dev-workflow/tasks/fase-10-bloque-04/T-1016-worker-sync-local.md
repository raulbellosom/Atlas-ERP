# T-1016 - Implementar worker local de sincronización

## Metadatos
- ID: `T-1016`
- Fase: `Fase 10`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
- `src/modules/sync/syncWorker.js`:
  - `runSyncCycle()`: orquesta dequeue → POST batch → aplica resultados.
  - Guarda `_isSyncing` para evitar ciclos concurrentes.
  - Verifica conectividad via `getDesktopNetworkStatus()` antes de intentar.
  - Lee `accessToken` de `localStorage["atlas-auth"]` sin importar el store Zustand (evita circular).
  - `postBatchToBackend(items, token)`: fetch POST a `${env.apiUrl}/v1/sync/batch`.
  - `applyBatchResults(items, results, sessionId)`: marca done/failed según respuesta del backend.
  - `getSyncWorkerStatus()`: estado observable del worker (isSyncing, lastSyncAt, lastError).
  - Retorna `{ skipped, reason?, synced, failed, error? }`.

## Criterios de aceptacion
- [x] runSyncCycle() no lanza errores no manejados.
- [x] Devuelve skipped=true si offline o ya syncing.
- [x] lint + build:web OK.
