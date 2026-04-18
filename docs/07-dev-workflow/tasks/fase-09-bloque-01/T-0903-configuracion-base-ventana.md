# T-0903 - Configurar configuración base de ventana

## Metadatos
- ID: `T-0903`
- Fase: `Fase 9`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Definir una configuración inicial de ventana desktop consistente con operación administrativa: tamaño cómodo, mínimos de usabilidad y comportamiento estable.

## Implementación
- Se ajustó la ventana principal en `tauri.conf.json`:
  - `title`: `AtlasERP Desktop`
  - `width`: `1440`
  - `height`: `900`
  - `minWidth`: `1024`
  - `minHeight`: `640`
  - `resizable`: `true`
  - `fullscreen`: `false`
  - `maximized`: `false`
  - `center`: `true`

## Criterios de aceptación
- [x] Configuración base de ventana definida en Tauri.
- [x] Restricciones mínimas de tamaño aplicadas.
- [x] Título de ventana alineado a branding provisional.

## Evidencia
- `apps/desktop/src-tauri/tauri.conf.json`

