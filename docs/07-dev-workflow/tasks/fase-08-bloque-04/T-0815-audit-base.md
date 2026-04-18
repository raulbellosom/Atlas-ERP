# T-0815 - Configurar módulo visual de audit base

## Metadatos
- ID: `T-0815`
- Fase: `Fase 8`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/pages/audit/AuditPage.jsx`: tabla con paginación real (anterior/siguiente).
- Columnas: Acción (mono brand), Entidad + entityId (mono truncado), Actor, Resultado (badge verde/rojo/gris), Fecha.
- `useQuery` → `GET /v1/audit/logs?organizationId&page&limit`.
- `placeholderData` para no limpiar tabla durante cambio de página.
- Ruta `/audit` y nav item "Auditoría" en Sidebar.

## Criterios de aceptacion
- [x] Tabla muestra logs reales del backend.
- [x] Paginación funcional.
- [x] lint + build OK.
