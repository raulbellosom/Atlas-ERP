# T-0306 - Configurar format global

## Metadatos
- ID: `T-0306`
- Fase: `Fase 3`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Configurar Prettier como formateador global del monorepo, con config compartida desde `@atlasrep/config` y archivo raíz que la extiende.

## Criterios de aceptación
- [x] `packages/config/prettier/index.mjs` — config Prettier base (singleQuote, tabWidth 2, endOfLine lf, etc.).
- [x] `.prettierrc.mjs` raíz — importa y re-exporta la config compartida.
- [x] `.prettierignore` raíz — excluye node_modules, dist, prisma/migrations, pnpm-lock.yaml.
- [x] `prettier` añadido a devDependencies raíz.
- [x] Scripts `format` y `format:check` en package.json raíz.
- [x] `endOfLine: "lf"` — forzado para consistencia cross-platform (Windows/Linux/CI).

## Archivos creados/modificados
- `packages/config/prettier/index.mjs`
- `.prettierrc.mjs`
- `.prettierignore`
- `package.json` (raíz) — scripts format/format:check y devDependency prettier

## Decisiones técnicas
- **`endOfLine: "lf"`**: Forzado a LF aunque el dev use Windows. Git y CI requieren LF.
- **`singleQuote: true`**: Consistencia con el canon de código.
- **`printWidth: 100`**: Más ancho que el estándar 80 — razonable para TypeScript moderno.
- **`.prettierrc.mjs` en raíz**: Permite que Prettier lo detecte automáticamente.
- **Overrides por tipo**: JSON con printWidth 80, Markdown con proseWrap always.

## Pendientes no resueltos
- Ninguno. Cada app usa la config compartida — no necesita su propio `.prettierrc`.
