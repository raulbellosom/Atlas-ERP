# T-0826 - Configurar indicador de conexión

## Metadatos
- ID: `T-0826`
- Fase: `Fase 8`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/layout/ConnectionIndicator.jsx`:
  - Punto (dot) 8px: verde cuando online, amarillo cuando offline.
  - Tooltip nativo via `title` attribute.
  - Integrado en `TopBar` a la izquierda del email del usuario.

## Criterios de aceptacion
- [x] Punto visible en la TopBar.
- [x] Cambia de color segun estado de red.
- [x] lint + build OK.
