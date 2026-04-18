# T-0918 - Configurar panel local de estado de sincronización

## Metadatos
- ID: `T-0918`
- Fase: `Fase 9`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Construir un panel local en desktop para visualizar estado de sincronización y señales operativas clave.

## Implementación
- Componente agregado:
  - `src/components/sync/LocalSyncStatusPanel.jsx`
- Muestra:
  - modo de boot
  - estado de red
  - conteos por estado de cola (`pending`, `processing`, `failed`, `done`)
  - items recuperados al reinicio
  - pendientes operativos
  - canal de updater
- Se conecta desde `App.jsx` con estado de `useDesktopBootstrap`.

## Criterios de aceptación
- [x] Panel local de sync renderiza datos de cola.
- [x] Panel expone indicadores de red/boot/update.
- [x] Integración con bootstrap y repositorio local de sync.

## Evidencia
- `apps/desktop/src/components/sync/LocalSyncStatusPanel.jsx`
- `apps/desktop/src/App.jsx`
- `apps/desktop/src/hooks/useDesktopBootstrap.js`

