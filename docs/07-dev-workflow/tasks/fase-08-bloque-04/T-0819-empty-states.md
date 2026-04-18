# T-0819 - Configurar empty states base

## Metadatos
- ID: `T-0819`
- Fase: `Fase 8`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/EmptyState.jsx`:
  - Props: `title` (requerido), `description?`, `action?` (React node), `icon?` (default "📭").
  - Centrado vertical con icono, título, descripción y slot de acción.

## Criterios de aceptacion
- [x] Componente exportado y listo para uso en tablas y listas.
- [x] lint + build OK.
