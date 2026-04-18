# T-0311 — Configurar scripts raíz del monorepo

- **Estado**: CERRADA
- **Fecha**: 2025-07-11

## Entregables

- `turbo.json` — Turborepo v2 pipeline:
  - `build`: dependsOn `^build`, outputs `dist/**`
  - `dev`: cache false, persistent true
  - `test`: cache false
  - `lint`: dependsOn `^build`
  - `typecheck`: dependsOn `^build`
  - `clean`: cache false
- `package.json` (root) — scripts migrados de `pnpm --recursive` a `turbo`:
  - `dev` → `turbo dev`
  - `build` → `turbo build`
  - `test` → `turbo test`
  - `lint` → `turbo lint`
  - `typecheck` → `turbo typecheck`
  - `clean` → `turbo clean`
  - `format` y `format:check` permanecen con prettier directo
  - `db:*`, `infra:*`, `prepare` sin cambios
