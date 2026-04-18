# T-0818 - Configurar error boundaries

## Metadatos
- ID: `T-0818`
- Fase: `Fase 8`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/components/ui/ErrorBoundary.jsx`: class component (requerido por la API de React).
  - `getDerivedStateFromError` captura el error.
  - `componentDidCatch` loggea a consola.
  - `reset()` restaura el estado para reintentar.
  - Prop `fallback`: nodo React, función `(error, reset) => JSX`, o `undefined` (usa UI por defecto).
  - UI por defecto: icono ⚠, título, mensaje del error, botón "Reintentar".
- `ErrorBoundary` wrappea toda la app en `App.jsx` (nivel raíz).

## Criterios de aceptacion
- [x] Errores de renderizado capturados sin pantalla en blanco.
- [x] Botón Reintentar funcional (reset de estado).
- [x] lint + build OK.
