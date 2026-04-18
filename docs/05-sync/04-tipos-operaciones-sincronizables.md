# Tipos de Operaciones Sincronizables

## ID de definición
- Task origen: `T-1002`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Catálogo oficial v1
- `create`
- `update`
- `upsert`
- `soft_delete`
- `restore`
- `resolve_conflict`

## Reglas
- Toda operación debe declararse en `batch.items[].operation`.
- Operaciones no listadas se rechazan en validación contractual.
- Operaciones de riesgo alto se validan adicionalmente en backend.

## Fuente técnica
- `packages/sync-contracts/src/operations.js`
