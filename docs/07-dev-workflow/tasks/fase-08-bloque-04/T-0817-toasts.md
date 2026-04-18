# T-0817 - Configurar sistema de toasts/notificaciones

## Metadatos
- ID: `T-0817`
- Fase: `Fase 8`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/Toast.jsx`: implementación propia sin dependencias externas.
  - `ToastProvider` con `useReducer` (ADD/REMOVE).
  - `useToast()` hook: `{ toast: { success, error, info, warning } }`.
  - `ToastStack`: stack fijo en bottom-right con `aria-live="polite"`.
  - Auto-dismiss en `duration` ms (default 4000). `duration=0` persiste.
  - Variantes: success (verde), error (rojo), warning (amarillo), info (azul).
- `ToastProvider` integrado en `App.jsx` (dentro de `QueryClientProvider`).

## Criterios de aceptacion
- [x] useToast() disponible en toda la app.
- [x] Toasts aparecen y desaparecen automáticamente.
- [x] Sin dependencias externas.
- [x] lint + build OK.
