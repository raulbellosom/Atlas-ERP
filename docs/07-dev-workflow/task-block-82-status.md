# Task Block 82 Status — Fase 10 Bloque 6

## Identificacion
- Bloque: `Bloque 6`
- Fase: `Fase 10`
- Tasks: `T-1025` a `T-1029`
- Estado: `CERRADO`
- Fecha de cierre: `2026-04-13`

## Tasks del bloque

| Task | Titulo | Estado |
|------|--------|--------|
| T-1025 | Implementar resolucion automatica solo donde sea seguro | CERRADA |
| T-1026 | Implementar rechazo explicito de merges peligrosos | CERRADA |
| T-1027 | Implementar diff minimo entre registros | CERRADA |
| T-1028 | Implementar centro de conflictos en backend | CERRADA |
| T-1029 | Implementar UI del Sync Center: pendientes | CERRADA |

## Entregables

### `apps/api/src/modules/sync/sync.service.ts` (extendido)
- `AutoResolveStrategy` — tipo exportado: `'APPROVE_LOCAL' | 'KEEP_SERVER' | 'none'` (T-1025)
- `ENTITY_RESOLVE_STRATEGIES` — mapa entity → estrategia (T-1025)
- `getAutoResolveStrategy(entity, operation)` — retorna 'none' para 'delete', estrategia para el resto (T-1025)
- `DANGEROUS_ENTITIES` — set: financial_movement, financial_transfer, financial_account (T-1026)
- `isDangerousMerge(entity, operation)` — true si entidad peligrosa y operacion != delete (T-1026)
- `MinimalDiff` — interfaz exportada: `{ added, removed, changed:{k:{from,to}} }` (T-1027)
- `computeMinimalDiff(local, server)` — diff campo a campo exportado (T-1027)
- `findConflicts(query)` — lista con paginacion y filtros entityType/status (T-1028)
- `findConflictById(id)` — retorna payloads completos (localPayload, serverPayload) (T-1028)
- `processSingleItem` refactorizado — usa getAutoResolveStrategy, isDangerousMerge, computeMinimalDiff; conflictos peligrosos → IN_REVIEW (T-1025/T-1026/T-1027)

### `apps/api/src/modules/sync/dto/list-conflicts.query.dto.ts` (nuevo — T-1028)
- Extiende PaginationQueryDto con filtros: organizationId?, entityType?, status?

### `apps/api/src/modules/sync/sync.controller.ts` (extendido — T-1028)
- `GET /v1/sync/conflicts` → `findConflicts(query)` con ListConflictsQueryDto
- `GET /v1/sync/conflicts/:id` → `findConflictById(id)` con payloads completos

### `apps/desktop/src/components/sync/SyncCenterPendingTable.jsx` (nuevo — T-1029)
- Tabla de items de sincronizacion local con columnas: entidad, ID, operacion, status, aprobacion, intentos, creado
- Acciones de aprobar/rechazar para items en pending_review
- Boton de recarga manual

### `apps/desktop/src/App.jsx` (extendido — T-1029)
- Monta `<SyncCenterPendingTable />` entre LocalSyncStatusPanel y logs locales

## Validaciones
- pnpm --filter api lint: OK
- pnpm --filter api typecheck: OK
- pnpm --filter @atlasrep/desktop run lint: OK
- pnpm --filter @atlasrep/desktop run build:web: OK (52 modulos, 1.40s)
