# T-0308 - Configurar Husky o equivalente

## Metadatos
- ID: `T-0308`
- Fase: `Fase 3`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Configurar Husky v9 como gestor de Git hooks para el monorepo, activando automáticamente los hooks `pre-commit` y `commit-msg` en `pnpm install`.

## Criterios de aceptación
- [x] `husky` añadido a devDependencies raíz.
- [x] Script `"prepare": "husky"` añadido a `package.json` raíz — inicializa Husky al instalar.
- [x] `.husky/pre-commit` — ejecuta `lint-staged` antes de cada commit.
- [x] `.husky/commit-msg` — valida mensaje con Commitlint.
- [x] `commitlint.config.mjs` creado con tipos válidos (feat, fix, docs, style, refactor, test, chore, build, ci, perf, revert).
- [x] `@commitlint/cli` y `@commitlint/config-conventional` añadidos a devDependencies raíz.

## Archivos creados/modificados
- `.husky/pre-commit`
- `.husky/commit-msg`
- `commitlint.config.mjs`
- `package.json` (raíz) — script prepare, devDependencies husky + commitlint

## Decisiones técnicas
- **Husky v9**: La API simplificada (`pnpm prepare`) elimina la necesidad de `husky install`.
- **`pre-commit` llama a lint-staged**: No ejecuta lint en todo el proyecto — solo archivos en staging (rápido).
- **`commit-msg` con Commitlint**: Canon de commits Conventional Commits es obligatorio.
- **Tipos de commit del canon AtlasERP**: `feat, fix, docs, style, refactor, test, chore, build, ci, perf, revert`.

## Pendientes no resueltos
- Ninguno. Husky se activa en el primer `pnpm install` por el script `prepare`.
