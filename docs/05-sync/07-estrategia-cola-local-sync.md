# Estrategia de Cola Local de Sync

## ID de definición
- Task origen: `T-1005`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Política oficial
La cola local de sync se procesa con `FIFO` por `occurredAt`, con persistencia local y recuperación tras reinicio.

## Reglas base
- Estados permitidos: `pending`, `processing`, `failed`, `conflicted`, `done`, `canceled`.
- Transiciones válidas controladas por contrato.
- Tamaño máximo de lote por proceso: `100` items.
- Tiempo de bloqueo por item en `processing`: `30000 ms`.
- Recuperación tras reinicio: obligatoria.

## Fuente técnica
- `packages/sync-contracts/src/queue.js`
