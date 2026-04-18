# T-0916 - Configurar arranque desktop autenticado

## Metadatos
- ID: `T-0916`
- Fase: `Fase 9`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Definir flujo de arranque desktop que detecta sesión activa y coloca la app en modo autenticado.

## Implementación
- Hook de bootstrap agregado:
  - `src/hooks/useDesktopBootstrap.js`
- Lógica de arranque autenticado:
  - Carga sesión local y perfil cacheado.
  - Evalúa vigencia de sesión con `hasActiveSession`.
  - Determina `bootMode = authenticated` cuando la sesión es válida.
- Estado de boot reflejado en UI con `BootBadge`.

## Criterios de aceptación
- [x] Arranque reconoce sesión válida local.
- [x] Estado de modo autenticado disponible para UI.
- [x] Lógica centralizada en hook reutilizable.

## Evidencia
- `apps/desktop/src/hooks/useDesktopBootstrap.js`
- `apps/desktop/src/App.jsx`

