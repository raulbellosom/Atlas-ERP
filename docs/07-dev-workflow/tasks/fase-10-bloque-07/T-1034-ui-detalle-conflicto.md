# T-1034 - Implementar UI de detalle de conflicto

## Metadatos
- ID: `T-1034`
- Fase: `Fase 10`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
`apps/desktop/src/components/sync/ConflictDetailPanel.jsx` — panel lateral de detalle:

- Panel deslizante desde la derecha (`translate-x` con transition 300ms)
- Overlay semitransparente con `backdrop-blur-sm`; cierra al hacer click
- Cierre con tecla Escape (event listener en window)
- Bloqueo de scroll del body cuando el panel esta abierto
- Secciones del panel:
  - **Metadatos** (dl grid 2 col): operacion, estado, aprobacion, intentos, creado, retry_at
  - **Error del backend** (visible si `lastError` presente): pre con estilo rose
  - **Payload local**: pre con JSON formateado (`formatJson` — JSON.parse si es string, luego JSON.stringify indent 2)
  - **Clave de idempotencia** (si existe): bloque font-mono
- Boton Cerrar en footer + boton X en header
- Accesibilidad: `role="dialog"`, `aria-modal="true"`, `aria-label`

## Criterios de aceptacion
- [x] Panel se abre y cierra con animacion suave.
- [x] Escape cierra el panel.
- [x] Click en overlay cierra el panel.
- [x] Payload JSON formateado correctamente (tanto string como objeto).
- [x] Build OK.
