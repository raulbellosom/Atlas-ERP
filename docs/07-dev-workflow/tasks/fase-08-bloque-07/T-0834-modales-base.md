# T-0834 - Configurar modales base

## Metadatos
- ID: `T-0834`
- Fase: `Fase 8`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/Modal.jsx`:
  - `createPortal` en `document.body`.
  - Overlay con `backdrop-blur-sm` y cierre al hacer click (configurable con `closeOnOverlay`).
  - Cierre con tecla `Escape`.
  - Bloqueo de scroll del body mientras está abierto.
  - Props: `open`, `onClose`, `title`, `children`, `footer` (slot), `size` (sm/md/lg/xl), `closeOnOverlay`.
  - Accesibilidad: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.

## Criterios de aceptacion
- [x] Modal renderizado via portal fuera del árbol del componente padre.
- [x] Escape cierra el modal.
- [x] lint + build OK.
