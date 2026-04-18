# T-0305 - Configurar lint global

## Metadatos
- ID: `T-0305`
- Fase: `Fase 3`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Configurar ESLint v9 (flat config) como linter global del monorepo, con configs base, TypeScript, React y NestJS compartidas desde `@atlasrep/config`.

## Criterios de aceptación
- [x] `packages/config/eslint/base.mjs` — reglas base para todos los proyectos.
- [x] `packages/config/eslint/typescript.mjs` — extensión TypeScript (no-any, return-await, etc.).
- [x] `packages/config/eslint/react.mjs` — extensión React+Hooks para apps/web (JS).
- [x] `packages/config/eslint/nest.mjs` — extensión NestJS para apps/api y apps/worker.
- [x] `packages/config/package.json` actualizado con exports y peerDependencies.
- [x] `eslint.config.mjs` raíz creado (aplica a tooling de raíz; apps definen el suyo).
- [x] `eslint` añadido a devDependencies raíz.
- [x] Canon respetado: `@typescript-eslint/no-explicit-any: error`, `no-console: warn`.

## Archivos creados/modificados
- `packages/config/eslint/base.mjs`
- `packages/config/eslint/typescript.mjs`
- `packages/config/eslint/react.mjs`
- `packages/config/eslint/nest.mjs`
- `packages/config/package.json`
- `eslint.config.mjs`
- `package.json` (raíz) — scripts lint/lint:fix y devDependency eslint

## Decisiones técnicas
- **ESLint v9 flat config**: Adoptado por ser el estándar moderno (v8 en EOL).
- **Formato `.mjs`**: Necesario para que los configs sean ES modules sin configurar `"type": "module"` en cada paquete.
- **Sin `any`**: Regla `error` en TypeScript, no `warn`. Canon lo exige explícitamente.
- **Web usa JS, no TS**: `apps/web` usa JavaScript, por lo que solo aplica la config de React.

## Pendientes no resueltos
- Ninguno. Cada app creará su `eslint.config.mjs` local en su task de setup (T-0323+).
