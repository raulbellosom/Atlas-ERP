# T-1017 - Implementar endpoints backend de sync batch

## Metadatos
- ID: `T-1017`
- Fase: `Fase 10`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
- `POST /v1/sync/batch` en `SyncController`.
  - Autenticado (JWT guard heredado del módulo).
  - Body: `SyncBatchRequestDto` — `items[]` (1-100 items), `deviceRegistryId?`.
  - Delega a `SyncService.processBatch()`.
  - Retorna `SyncBatchResult`: `{ sessionId, results[], synced, conflicted, errors }`.

## Criterios de aceptacion
- [x] Endpoint disponible y validado con class-validator.
- [x] typecheck + lint OK.
