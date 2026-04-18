# T-0309 - Configurar lint-staged o equivalente

## Metadatos
- ID: `T-0309`
- Fase: `Fase 3`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Configurar lint-staged para que, en cada commit, ESLint y Prettier se ejecuten solo sobre los archivos modificados que están en staging — no sobre todo el proyecto.

## Criterios de aceptación
- [x] `lint-staged` añadido a devDependencies raíz.
- [x] `lint-staged.config.mjs` creado con reglas por tipo de archivo.
- [x] Archivos `.{ts,tsx}`: `eslint --fix --max-warnings=0` + `prettier --write`.
- [x] Archivos `.{js,jsx}`: `eslint --fix --max-warnings=0` + `prettier --write`.
- [x] Archivos `.{json,yaml,yml,md,css}`: solo `prettier --write`.
- [x] Hook `pre-commit` de Husky llama a `lint-staged` (T-0308).

## Archivos creados/modificados
- `lint-staged.config.mjs`
- `package.json` (raíz) — devDependency lint-staged

## Decisiones técnicas
- **`--max-warnings=0`**: Un warning de ESLint bloquea el commit. Disciplina desde el primer día.
- **ESLint antes de Prettier**: ESLint puede modificar código; Prettier reformatea el resultado final.
- **Solo staging**: lint-staged procesa únicamente los archivos en `git add`. Los archivos sin cambios no se tocan.
- **`lint-staged.config.mjs`**: Archivo separado para mantener el `package.json` raíz limpio.

## Pendientes no resueltos
- Ninguno. La configuración es operativa en el primer `pnpm install`.
