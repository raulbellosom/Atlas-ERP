# T-0917 - Configurar arranque desktop offline

## Metadatos
- ID: `T-0917`
- Fase: `Fase 9`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Permitir arranque offline del desktop cuando no hay red y existen credenciales/perfil local que lo habiliten.

## Implementación
- Detección de red integrada en bootstrap (`network_status`).
- Regla de arranque offline implementada con `canBootOffline`.
- `bootMode = offline` cuando:
  - no hay conectividad y
  - existe sesión/perfil local utilizable.
- Estado offline visible en UI y panel de sincronización.

## Criterios de aceptación
- [x] Arranque offline soportado en ausencia de red.
- [x] Dependencia de sesión/perfil local para modo offline.
- [x] Estado de arranque offline reflejado en shell.

## Evidencia
- `apps/desktop/src/hooks/useDesktopBootstrap.js`
- `apps/desktop/src/modules/session/localDesktopSessionRepository.js`
- `apps/desktop/src/App.jsx`

