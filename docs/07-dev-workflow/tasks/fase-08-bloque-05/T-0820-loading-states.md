# T-0820 - Configurar loading states base

## Metadatos
- ID: `T-0820`
- Fase: `Fase 8`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/Spinner.jsx`:
  - `Spinner` con sizes: `sm` (16px), `md` (24px), `lg` (40px).
  - `FullPageSpinner`: overlay centrado para carga de página completa.
- `src/components/ui/Skeleton.jsx`:
  - `Skeleton`: bloque genérico con animación pulse.
  - `TableRowSkeleton`: fila de tabla con N celdas configurables.
  - `CardSkeleton`: esqueleto de card con header y body.

## Criterios de aceptacion
- [x] Spinner y Skeleton exportados y listos.
- [x] lint + build OK.
