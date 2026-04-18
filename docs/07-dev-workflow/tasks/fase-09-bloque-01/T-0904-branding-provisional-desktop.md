# T-0904 - Configurar branding provisional de la app desktop

## Metadatos
- ID: `T-0904`
- Fase: `Fase 9`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Aplicar branding provisional para identificar la app desktop en runtime y empaquetado local, manteniendo trazabilidad del nombre AtlasERP.

## Implementación
- Branding en configuración Tauri:
  - `productName`: `AtlasERP Desktop`
  - `identifier`: `com.racoondevs.atlaserp.desktop`
  - `title` de ventana principal: `AtlasERP Desktop`
- Se generaron iconos provisionales locales para bundle:
  - `32x32.png`
  - `128x128.png`
  - `icon.ico`
- Se actualizó UI inicial desktop para reflejar marca y contexto.

## Criterios de aceptación
- [x] Nombre de producto desktop visible y consistente.
- [x] Identificador de aplicación configurado.
- [x] Iconografía provisional disponible para empaquetado local.

## Evidencia
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/icons/32x32.png`
- `apps/desktop/src-tauri/icons/128x128.png`
- `apps/desktop/src-tauri/icons/icon.ico`
- `apps/desktop/src/App.jsx`

