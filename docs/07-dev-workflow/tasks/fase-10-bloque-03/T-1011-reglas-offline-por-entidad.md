# T-1011 - Definir reglas por entidad para offline permitido/no permitido

## Metadatos
- ID: `T-1011`
- Fase: `Fase 10`
- Bloque: `Bloque 3`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `SyncCoreAgent`

## Alcance
Definir reglas explícitas por entidad y operación para determinar qué se puede encolar en modo offline.

## Implementación
- Se documentó la política en `docs/05-sync/13-reglas-offline-por-entidad.md`.
- Se implementó baseline contractual en `packages/sync-contracts/src/offlineRules.js`:
  - `OFFLINE_ENTITY_RULES`
  - `getOfflineRuleForEntity(entity)`
  - `canOperateOffline(entity, operation)`

## Criterios de aceptación
- [x] Catálogo offline por entidad publicado.
- [x] Regla default de bloqueo para entidades sin definición.
- [x] Helper de validación offline disponible para servicios de enqueue.

## Evidencia
- `docs/05-sync/13-reglas-offline-por-entidad.md`
- `packages/sync-contracts/src/offlineRules.js`
