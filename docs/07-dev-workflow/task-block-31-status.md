# Task Block 31 Status — Fase 3 / Bloque 3

| Campo           | Valor                    |
| --------------- | ------------------------ |
| Bloque          | 31 (Fase 3 / Bloque 3)  |
| Tasks           | T-0310 a T-0314          |
| Estado          | CERRADO                  |
| Fecha de cierre | 2025-07-11               |

## Tasks incluidas

| Task   | Descripción                                  | Estado  |
| ------ | -------------------------------------------- | ------- |
| T-0310 | Configurar path aliases donde aplique        | CERRADA |
| T-0311 | Configurar scripts raíz del monorepo         | CERRADA |
| T-0312 | Configurar scripts de dev por app            | CERRADA |
| T-0313 | Configurar scripts de build por app          | CERRADA |
| T-0314 | Configurar scripts de test por app           | CERRADA |

## Resumen de entregables

- `packages/config/tsconfig/base.json` — tsconfig base compartido
- `packages/config/tsconfig/nestjs.json` — tsconfig para NestJS apps
- `apps/api/tsconfig.json` — extends nestjs, path alias `@/*`
- `apps/worker/tsconfig.json` — extends nestjs, path alias `@/*`
- `apps/web/jsconfig.json` — IDE support + path alias `@/*`
- `apps/web/vite.config.js` — Vite config con resolve.alias
- `apps/desktop/jsconfig.json` — IDE support + path alias `@/*`
- `packages/config/package.json` — exporta tsconfig/* configs
- `turbo.json` — pipeline: build, dev, test, lint, typecheck, clean
- `package.json` (root) — scripts migrados a turbo
- `apps/api/eslint.config.mjs` — ESLint NestJS
- `apps/web/eslint.config.mjs` — ESLint React
- `apps/worker/eslint.config.mjs` — ESLint NestJS
- `apps/desktop/eslint.config.mjs` — ESLint React
- Scripts dev/build/test/lint reales en las 4 apps
