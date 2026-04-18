# T-0825 - Configurar modo offline visual base

## Metadatos
- ID: `T-0825`
- Fase: `Fase 8`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/hooks/useOnlineStatus.js`: hook con `useState(navigator.onLine)` + listeners de eventos `online`/`offline`.
- `src/components/ui/OfflineBanner.jsx`: banner amarillo con `role="alert"` y `aria-live="assertive"`.
  - Se monta en `PrivateLayout` encima de la TopBar.
  - Se oculta automaticamente cuando `isOnline === true`.

## Criterios de aceptacion
- [x] Banner visible al simular offline en DevTools.
- [x] Banner desaparece al volver a conectar.
- [x] lint + build OK.
