# T-0836 - Configurar breadcrumbs base

## Metadatos
- ID: `T-0836`
- Fase: `Fase 8`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/Breadcrumbs.jsx`:
  - Props: `items` (array de `{ label, to? }`).
  - Separador "/" entre items.
  - El último item no es enlace (item activo con `aria-current="page"`).
  - Items con `to` renderizan como `<Link>` de React Router.

## Criterios de aceptacion
- [x] Breadcrumbs navegables con items clickeables.
- [x] Item activo correctamente marcado.
- [x] lint + build OK.
