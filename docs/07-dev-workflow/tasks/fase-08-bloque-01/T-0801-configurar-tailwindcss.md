# T-0801 - Configurar TailwindCSS 4.1

## Metadatos
- ID: `T-0801`
- Fase: `Fase 8`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Integrar TailwindCSS 4.1 con Vite usando el plugin oficial `@tailwindcss/vite` (sin PostCSS).

## Alcance
- Actualizar `apps/web/vite.config.js`:
  - Importar `@tailwindcss/vite`.
  - Agregar `tailwindcss()` al array de plugins.
- Actualizar `apps/web/src/assets/index.css`:
  - Cambiar sintaxis v3 (`@tailwind base/components/utilities`) a v4 (`@import "tailwindcss"`).
- Añadir regla `react/jsx-uses-vars: "error"` en `packages/config/eslint/react.mjs` para que ESLint reconozca imports JSX como usados.

## Resultados
- TailwindCSS 4.1 genera 13.12 kB de CSS en build de producción.
- Clases utilitarias disponibles en todos los componentes.
- No se requiere `tailwind.config.js` (configuración via CSS `@theme {}`).

## Criterios de aceptacion
- [x] Plugin @tailwindcss/vite configurado en vite.config.js.
- [x] @import "tailwindcss" en index.css (sintaxis v4).
- [x] Build genera CSS correctamente.
- [x] lint OK.

## Notas técnicas
- TailwindCSS 4.x no usa `tailwind.config.js` — la configuración se hace via `@theme {}` en CSS.
- El plugin Vite reemplaza a `postcss-cli` y `autoprefixer`.
