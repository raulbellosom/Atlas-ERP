# T-0833 - Configurar tablas base

## Metadatos
- ID: `T-0833`
- Fase: `Fase 8`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/Table.jsx`:
  - Props: `columns` (array de `{ key, header, render? }`), `data`, `isLoading`, `emptyTitle`, `emptyDescription`, `emptyAction`, `keyField` (default "id"), `className`.
  - Loading: muestra `TableRowSkeleton` x5 filas.
  - Empty: muestra `EmptyState` en celda colspan.
  - Hover de fila con transición de color.

## Criterios de aceptacion
- [x] Tabla reutilizable con columnas configurables.
- [x] Estado loading y empty integrados.
- [x] lint + build OK.
