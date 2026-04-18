# T-0821 - Configurar componentización base reutilizable

## Metadatos
- ID: `T-0821`
- Fase: `Fase 8`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/Button.jsx`:
  - Variantes: `primary`, `secondary`, `ghost`, `danger`.
  - Sizes: `sm`, `md`, `lg`.
  - Prop `loading`: muestra spinner inline y deshabilita interacción.
- `src/components/ui/Badge.jsx`:
  - Variantes por color semántico: `green`, `red`, `yellow`, `gray`, `blue`.
- `src/components/ui/Card.jsx`:
  - `Card`, `CardHeader`, `CardBody` con padding y border radius consistentes.

## Criterios de aceptacion
- [x] Button, Badge y Card exportados y reutilizables.
- [x] lint + build OK.
