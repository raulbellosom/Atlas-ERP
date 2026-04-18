# T-0822 - Configurar manejo de formularios

## Metadatos
- ID: `T-0822`
- Fase: `Fase 8`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/Input.jsx`:
  - `forwardRef` para compatibilidad con react-hook-form.
  - Props: `label`, `error`, `helpText`, `className`.
  - Focus ring con color brand; focus ring rojo si `error` presente.
  - Compatible con `register()` de react-hook-form sin wrapper especial.

## Criterios de aceptacion
- [x] Input integrado con react-hook-form en LoginPage.
- [x] lint + build OK.
