# T-1003 - Definir esquema de payload de sync

## Metadatos
- ID: `T-1003`
- Fase: `Fase 10`
- Bloque: `Bloque 1`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `SyncCoreAgent`

## Alcance
Definir el esquema base del payload de sincronización y proveer constructor/validador mínimo para batch de operaciones.

## Implementación
- Se documentó esquema base y ejemplo JSON en `docs/05-sync/05-esquema-payload-sync.md`.
- Se implementó `buildSyncBatchPayload(params)` para normalizar payloads.
- Se implementó validación contractual con:
  - `validateSyncItem(item)`
  - `validateSyncBatchPayload(payload)`

## Criterios de aceptación
- [x] Esquema de payload documentado y versionado.
- [x] Builder contractual disponible.
- [x] Validador contractual mínimo disponible.

## Evidencia
- `docs/05-sync/05-esquema-payload-sync.md`
- `packages/sync-contracts/src/payload.js`
