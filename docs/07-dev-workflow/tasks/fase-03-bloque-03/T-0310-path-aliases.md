# T-0310 — Configurar path aliases donde aplique

- **Estado**: CERRADA
- **Fecha**: 2025-07-11

## Entregables

- `packages/config/tsconfig/base.json` — tsconfig base: ES2022, strict, isolatedModules, incremental
- `packages/config/tsconfig/nestjs.json` — extends base: commonjs, emitDecoratorMetadata, experimentalDecorators
- `apps/api/tsconfig.json` — extends nestjs, outDir dist, path alias `@/*` → `./src/*`
- `apps/worker/tsconfig.json` — extends nestjs, outDir dist, path alias `@/*` → `./src/*`
- `apps/web/jsconfig.json` — ESNext + Bundler, jsx react-jsx, path alias `@/*`
- `apps/web/vite.config.js` — Vite config con `resolve.alias` para `@` → `src/`
- `apps/desktop/jsconfig.json` — ESNext + Bundler, jsx react-jsx, path alias `@/*`
- `packages/config/package.json` — exports actualizados con `./tsconfig/base` y `./tsconfig/nestjs`
