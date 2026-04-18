# T-1005 - Definir estrategia de cola local

## Metadatos
- ID: `T-1005`
- Fase: `Fase 10`
- Bloque: `Bloque 2`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `SyncCoreAgent`

## Alcance
Definir política oficial de cola local para Sync Core con estados, transiciones y selección de lotes.

## Implementación
- Se documentó estrategia oficial en `docs/05-sync/07-estrategia-cola-local-sync.md`.
- Se implementó baseline técnico en:
  - `SYNC_QUEUE_STATES`
  - `SYNC_QUEUE_POLICY`
  - `canTransitionQueueState(fromState, toState)`
  - `pickQueueBatch(items, maxBatchSize)`

## Criterios de aceptación
- [x] Estados y transiciones de cola definidos.
- [x] Política base de procesamiento por lotes definida.
- [x] Referencia técnica y documental trazable.

## Evidencia
- `docs/05-sync/07-estrategia-cola-local-sync.md`
- `packages/sync-contracts/src/queue.js`
