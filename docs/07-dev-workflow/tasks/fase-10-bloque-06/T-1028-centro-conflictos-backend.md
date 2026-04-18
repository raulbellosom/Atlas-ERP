# T-1028 - Implementar centro de conflictos en backend

## Metadatos
- ID: `T-1028`
- Fase: `Fase 10`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
Nuevos endpoints y metodos para explorar el historial de conflictos:

### DTO nuevo: `dto/list-conflicts.query.dto.ts`
- Extiende `PaginationQueryDto`
- Filtros opcionales: `organizationId?`, `entityType?`, `status? (ConflictStatus enum)`

### Metodos nuevos en `sync.service.ts`
- `findConflicts(query: ListConflictsQueryDto)` — lista con paginacion (limit 50, max 200) y filtros
- `findConflictById(id)` — retorna ConflictDetail con `localPayload` y `serverPayload` completos

### Selector nuevo en `sync.service.ts`
- `CONFLICT_RECORD_DETAIL_SELECT` — incluye localPayload y serverPayload ademas de los campos del selector estandar

### Endpoints nuevos en `sync.controller.ts`
- `GET /v1/sync/conflicts` — lista paginada con filtros (usa ListConflictsQueryDto)
- `GET /v1/sync/conflicts/:id` — detalle con payloads completos; 404 si no existe

## Criterios de aceptacion
- [x] GET /v1/sync/conflicts acepta filtros entityType y status.
- [x] GET /v1/sync/conflicts/:id incluye localPayload y serverPayload.
- [x] 404 explicito si el conflicto no existe.
- [x] typecheck + lint OK.
