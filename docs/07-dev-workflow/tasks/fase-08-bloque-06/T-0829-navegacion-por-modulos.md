# T-0829 - Configurar navegación principal por módulos

## Metadatos
- ID: `T-0829`
- Fase: `Fase 8`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/layout/Sidebar.jsx` refactorizado con `NAV_GROUPS`:
  - **Principal**: Dashboard.
  - **Administracion**: Usuarios, Roles, Adjuntos.
  - **Sistema**: Auditoria, Sync Center (con badge de pendientes), Configuracion.
- Badge numerico en "Sync Center" cuando `pendingCount > 0`.
- Separadores de grupo con label en uppercase xs.

## Criterios de aceptacion
- [x] Nav agrupado visualmente por seccion.
- [x] Badge en Sync Center refleja `pendingCount` del store.
- [x] lint + build OK.
