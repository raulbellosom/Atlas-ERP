# T-1022 - Implementar persistencia backend de ConflictResolution

## Metadatos
- ID: `T-1022`
- Fase: `Fase 10`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
`sync.service.ts` — auto-resolución segura y resolución manual:

**Auto-resolución (T-1022a):**
- `SAFE_AUTO_RESOLVE_ENTITIES = { setting, feature_flag, device_registry }` — entidades LWW de bajo riesgo.
- `autoResolveConflict()`: transacción atómica que:
  1. Actualiza `ConflictRecord` → `status=RESOLVED`, `resolution=AUTO_RESOLVED`, `resolvedAt`.
  2. Crea `ConflictResolution` con `action=AUTO_RESOLVED`, `source=SYNC_ENGINE`.
  3. Actualiza `SyncItem` → `status=APPLIED`.
- Retorna `{ status: 'synced' }` al cliente con nota de auto-resolución.

**Resolución manual (pre-existente mejorada):**
- `resolveConflict()`: sin cambios funcionales, crea `ConflictResolution` con `source=WEB`.

## Criterios de aceptacion
- [x] Conflictos en `setting`/`feature_flag`/`device_registry` se auto-resuelven sin intervención.
- [x] ConflictResolution creado con source correcto (SYNC_ENGINE vs WEB).
- [x] typecheck + lint OK.
