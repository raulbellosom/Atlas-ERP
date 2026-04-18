# T-0832 - Configurar iconografía base

## Metadatos
- ID: `T-0832`
- Fase: `Fase 8`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/Icon.jsx`:
  - Biblioteca SVG inline sin dependencias externas.
  - Iconos incluidos: check, x, alert-triangle, info, chevron-left/right/down/up, search, plus, trash, edit, refresh, logout, user, wifi, wifi-off.
  - Props: `name` (string), `size` (default 16), `className`.
  - Warning en DEV si el nombre no existe.

## Criterios de aceptacion
- [x] Icono renderable con `<Icon name="check" />`.
- [x] Sin dependencias NPM adicionales.
- [x] lint + build OK.
