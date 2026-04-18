# T-0805 - Configurar layout shell público/privado

## Metadatos
- ID: `T-0805`
- Fase: `Fase 8`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Implementar los layouts shell que envuelven rutas públicas y privadas.

## Alcance (implementado en Bloque 1 como parte de T-0804)
- `PublicLayout.jsx` — centrado vertical, fondo neutro, Outlet.
- `PrivateLayout.jsx` — Sidebar fijo izquierdo + TopBar + main scrollable.
- `Sidebar.jsx` — NavLink con estado activo (brand), expandible con módulos futuros.
- `TopBar.jsx` — email del usuario + botón de logout.

## Criterios de aceptacion
- [x] PublicLayout centra el contenido.
- [x] PrivateLayout muestra sidebar + contenido.
- [x] Sidebar destaca ruta activa con clases brand.
- [x] lint + build OK.
