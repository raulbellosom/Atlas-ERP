# T-0915 - Configurar sesión local desktop

## Metadatos
- ID: `T-0915`
- Fase: `Fase 9`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Establecer una sesión local de desktop persistida de forma segura para soportar arranque rápido y operación offline-first.

## Implementación
- Repositorio local de sesión agregado:
  - `src/modules/session/localDesktopSessionRepository.js`
- Funciones implementadas:
  - `saveDesktopSession`
  - `loadDesktopSession`
  - `clearDesktopSession`
  - `saveCachedProfile`
  - `loadCachedProfile`
  - `hasActiveSession`
  - `canBootOffline`
- Persistencia basada en secure storage desktop (`namespace: auth`).
- Integración visible desde shell con acciones de simulación/limpieza de sesión.

## Criterios de aceptación
- [x] Sesión local persistible y recuperable.
- [x] Perfil cacheado disponible para arranque offline.
- [x] Operaciones de limpieza de sesión soportadas.

## Evidencia
- `apps/desktop/src/modules/session/localDesktopSessionRepository.js`
- `apps/desktop/src/App.jsx`

