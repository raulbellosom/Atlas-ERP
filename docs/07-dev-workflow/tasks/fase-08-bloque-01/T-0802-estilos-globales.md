# T-0802 - Configurar sistema de estilos globales

## Metadatos
- ID: `T-0802`
- Fase: `Fase 8`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Definir el sistema de design tokens y estilos globales usando la API `@theme {}` de TailwindCSS 4.1.

## Alcance
- Actualizar `apps/web/src/assets/index.css`:
  - Bloque `@theme {}` con:
    - Paleta de marca (`--color-brand-50` a `--color-brand-950`) en OKLCH.
    - Colores semánticos: `--color-surface`, `--color-surface-subtle`, `--color-border`, `--color-text-primary`, `--color-text-secondary`, `--color-text-disabled`.
    - Tipografía: `--font-sans` (Inter + system fallbacks), `--font-mono`.
    - Radios: `--radius-sm` a `--radius-xl`.
  - Bloque `@layer base {}` con reset de box-model, font-smoothing, scrollbar minimal.

## Resultados
- Design tokens accesibles como clases Tailwind: `text-brand-600`, `bg-surface`, `border-border`, etc.
- Scrollbar discreta en toda la app.
- Font-smoothing activado globalmente.

## Criterios de aceptacion
- [x] Tokens definidos en @theme {}.
- [x] Clases utilitarias funcionando en componentes (bg-brand-50, text-text-secondary, etc.).
- [x] Build OK.

## Notas técnicas
- Los tokens en `@theme {}` se convierten automáticamente en variables CSS y en clases Tailwind.
- OKLCH es el espacio de color moderno recomendado por Tailwind v4.
