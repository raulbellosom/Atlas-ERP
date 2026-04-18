# T-0312 — Configurar scripts de dev por app

- **Estado**: CERRADA
- **Fecha**: 2025-07-11

## Entregables

| App      | Script dev              | Script lint   | ESLint config                   |
| -------- | ----------------------- | ------------- | ------------------------------- |
| api      | `nest start --watch`    | `eslint .`    | `eslint.config.mjs` (nest)     |
| web      | `vite`                  | `eslint .`    | `eslint.config.mjs` (react)    |
| worker   | `nest start --watch`    | `eslint .`    | `eslint.config.mjs` (nest)     |
| desktop  | `tauri dev`             | `eslint .`    | `eslint.config.mjs` (react)    |

Todos los `echo 'TODO: ...'` reemplazados por comandos reales.
Se crearon 4 eslint.config.mjs por app extendiendo @atlasrep/config.
