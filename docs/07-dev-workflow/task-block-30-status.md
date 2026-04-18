# Estado de Ejecución - Fase 3 / Bloque 2

## Contexto
- Fecha de cierre de bloque: **2026-04-12**
- Fase 3: Monorepo, paquetes base y tooling
- Bloque 2: Lint, format, EditorConfig, Git hooks

## Estado del bloque
- Bloque `T-0305` a `T-0309`: **CERRADO**

## Estado por task

| ID     | Título                          | Estado  | Evidencia                                                                                                  |
| ------ | ------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| T-0305 | Configurar lint global          | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-02/T-0305-configurar-lint-global.md`                            |
| T-0306 | Configurar format global        | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-02/T-0306-configurar-format-global.md`                          |
| T-0307 | Configurar EditorConfig         | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-02/T-0307-configurar-editorconfig.md`                           |
| T-0308 | Configurar Husky o equivalente  | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-02/T-0308-configurar-husky.md`                                  |
| T-0309 | Configurar lint-staged          | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-02/T-0309-configurar-lint-staged.md`                            |

## Archivos creados en este bloque

### Configs compartidas (`packages/config`)
- `packages/config/eslint/base.mjs` — reglas ESLint base (todos los proyectos)
- `packages/config/eslint/typescript.mjs` — extensión TypeScript (no-any, return-await)
- `packages/config/eslint/react.mjs` — extensión React + Hooks (apps/web JS)
- `packages/config/eslint/nest.mjs` — extensión NestJS (apps/api, apps/worker)
- `packages/config/prettier/index.mjs` — config Prettier compartida
- `packages/config/package.json` — actualizado con exports y peerDependencies

### Archivos raíz del monorepo
- `eslint.config.mjs` — config ESLint raíz (tooling de raíz)
- `.prettierrc.mjs` — importa config de `@atlasrep/config/prettier`
- `.prettierignore` — exclusiones de Prettier
- `.editorconfig` — actualizado con overrides para Rust, Makefile, Markdown
- `.husky/pre-commit` — ejecuta lint-staged antes de cada commit
- `.husky/commit-msg` — valida mensaje con Commitlint
- `commitlint.config.mjs` — tipos de commit del canon AtlasERP
- `lint-staged.config.mjs` — reglas por tipo de archivo
- `package.json` — scripts lint/format/prepare + devDependencies actualizadas

## Siguiente bloque
**Fase 3 / Bloque 3** (`T-0310` a `T-0314`): Path aliases, scripts raiz del monorepo (turbo.json), scripts de dev/build/test por app.
