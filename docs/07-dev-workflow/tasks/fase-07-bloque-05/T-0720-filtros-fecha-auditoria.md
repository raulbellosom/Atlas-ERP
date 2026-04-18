# T-0720 - Filtros de fecha en consulta de auditoría

## Metadatos
- ID: `T-0720`
- Fase: `Fase 7`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Agregar filtros por rango de fechas (`from` / `to`) al endpoint GET /v1/audit/logs para permitir consultas acotadas temporalmente.

## Alcance
- Actualizar `apps/api/src/modules/audit/dto/list-audit-logs.query.dto.ts`:
  - Agregar `from?: string` (@IsDateString).
  - Agregar `to?: string` (@IsDateString).
- Actualizar `apps/api/src/modules/audit/audit.service.ts`:
  - Aplicar `createdAt: { gte: new Date(from), lte: new Date(to) }` en el `where` del `findAll`.

## Resultados
- GET /v1/audit/logs?from=2026-01-01&to=2026-12-31 filtra correctamente por rango de fechas.
- Filtros son opcionales e independientes (solo `from`, solo `to`, o ambos).

## Criterios de aceptacion
- [x] DTO acepta from y to como ISO date strings opcionales.
- [x] Service aplica filtro createdAt gte/lte según presencia de from/to.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Cursor-based filtering o filtros por hora exacta (solo fecha).

## Dependencias
- T-0719 (paginación de audit logs ya implementada).
