# T-0719 - Implementar consulta paginada de auditoria

## Metadatos
- ID: `T-0719`
- Fase: `Fase 7`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Agregar paginacion real (offset + count) al endpoint GET /v1/audit/logs para soportar grandes volumenes de registros de auditoria.

## Alcance
- Actualizar `apps/api/src/modules/audit/dto/list-audit-logs.query.dto.ts`:
  - Agregar `page?: number` (@IsInt, @Min(1)).
- Actualizar `apps/api/src/modules/audit/audit.service.ts`:
  - Importar `resolvePaginationQuery`, `toPaginatedResult`, `PaginatedResult` de `../../common/pagination`.
  - `findAll()` ahora retorna `PaginatedResult<AuditLogSummary>`.
  - Usa `resolvePaginationQuery` para obtener skip/limit.
  - Ejecuta `findMany` + `count` en paralelo con `Promise.all`.
  - Retorna `toPaginatedResult(items, total, pagination)`.

## Resultados
- GET /v1/audit/logs retorna `{items:[...], pagination:{page,limit,total,totalPages}}`.
- Con limit=5: pagination correcto con 3 entradas existentes.

## Criterios de aceptacion
- [x] findAll retorna PaginatedResult con items y pagination.
- [x] page y limit son opcionales con defaults (page=1, limit=50).
- [x] count ejecutado en paralelo con findMany (sin N+1).
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Cursor-based pagination para scroll infinito (offset es suficiente para audit logs).
- Cache de resultados paginados.

## Dependencias
- Utilidades de paginacion ya existian en `../../common/pagination` (T-0628).

## Pendientes no resueltos
- Ninguno.
