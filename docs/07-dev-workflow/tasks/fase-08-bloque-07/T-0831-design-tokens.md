# T-0831 - Configurar tema base y design tokens

## Metadatos
- ID: `T-0831`
- Fase: `Fase 8`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/assets/index.css` — extension del bloque `@theme {}`:
  - **Colores de estado**: `--color-success`, `--color-success-subtle`, `--color-error`, `--color-error-subtle`, `--color-warning`, `--color-warning-subtle`, `--color-info`, `--color-info-subtle`.
  - **Sombras**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`.
  - **Transiciones**: `--transition-fast` (100ms), `--transition-base` (150ms), `--transition-slow` (250ms).

## Criterios de aceptacion
- [x] Tokens disponibles como clases de TailwindCSS en toda la app.
- [x] lint + build OK.
