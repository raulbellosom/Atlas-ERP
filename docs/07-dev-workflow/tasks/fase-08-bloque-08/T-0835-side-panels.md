# T-0835 - Configurar paneles laterales base

## Metadatos
- ID: `T-0835`
- Fase: `Fase 8`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/SidePanel.jsx`:
  - Drawer deslizante desde la derecha con CSS transform + transition.
  - `createPortal` en `document.body`.
  - Props: `open`, `onClose`, `title`, `children`, `footer`, `size` (sm/md/lg), `closeOnOverlay`.
  - Cierre con Escape y bloqueo de scroll del body.
  - Accesibilidad: `role="dialog"`, `aria-modal`, `aria-labelledby`.

## Criterios de aceptacion
- [x] Panel se desliza desde la derecha al abrir.
- [x] Overlay + Escape cierran el panel.
- [x] lint + build OK.
