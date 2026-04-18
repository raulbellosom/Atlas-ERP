# T-0816 - Configurar módulo visual de attachments base

## Metadatos
- ID: `T-0816`
- Fase: `Fase 8`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/pages/attachments/AttachmentsPage.jsx`: tabla de adjuntos.
- Columnas: Nombre, Tipo (MIME en mono), Tamaño (formatBytes: B/KB/MB), Entidad + entityId, Fecha.
- `useQuery` → `GET /v1/attachments?organizationId`.
- Ruta `/attachments` y nav item "Adjuntos" en Sidebar.

## Criterios de aceptacion
- [x] Tabla muestra adjuntos reales del backend.
- [x] Tamaño en bytes formateado legiblemente.
- [x] lint + build OK.
