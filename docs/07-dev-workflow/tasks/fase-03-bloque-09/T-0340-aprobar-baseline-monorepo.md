# T-0340 - Aprobar baseline del monorepo

## Metadatos
- ID: `T-0340`
- Fase: `Fase 3`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `SystemArchitectAgent`

## Objetivo
Hacer la revision final del monorepo, verificar que todos los criterios de baseline esten cubiertos y declarar formalmente la Fase 3 completada.

## Criterios de aceptación — Verificacion de baseline

### Estructura del monorepo
- [x] `apps/api/`, `apps/web/`, `apps/desktop/`, `apps/worker/` — creadas con package.json.
- [x] `packages/ui/`, `packages/shared/`, `packages/validation/`, `packages/sync-contracts/`, `packages/sdk/`, `packages/config/` — creadas con package.json.
- [x] `prisma/migrations/`, `prisma/seeds/` — creados.
- [x] `infra/docker/`, `infra/nginx/`, `infra/scripts/`, `infra/backup/` — creados.
- [x] `tools/generators/`, `.github/workflows/` — creados.

### Tooling
- [x] pnpm 9 + workspaces configurados (`pnpm-workspace.yaml`).
- [x] Turbo 2 con pipeline (build, dev, test, lint, typecheck, clean).
- [x] ESLint 9 flat config: base, typescript, react, nest.
- [x] Prettier 3 con config compartida desde `@atlasrep/config`.
- [x] EditorConfig con overrides para Rust y Markdown.
- [x] Husky 9 + Commitlint + lint-staged operativos.
- [x] Path aliases: `@/*` → `./src/*` en api, worker (tsconfig), web, desktop (jsconfig + Vite).

### Scripts raíz completos
- [x] dev, build, test, lint, format, typecheck, clean, clean:all.
- [x] bootstrap, reset:local, prepare.
- [x] db:migrate, db:migrate:prod, db:migrate:status, db:generate, db:seed, db:reset, db:studio.
- [x] infra:up, infra:down, infra:reset, infra:logs, infra:status.
- [x] changeset, version-packages, release:notes.

### Configuracion de entorno
- [x] `.env.example` raíz y por cada app (api, web, worker, desktop).
- [x] Validacion de env vars en arranque (fail fast): api, worker (class-validator), web, desktop (Vite).
- [x] Estrategia y referencia de env vars documentadas en `docs/02-architecture/`.

### Estructura de apps
- [x] `apps/api/src/` — main.ts + modules/, common/, config/, infrastructure/.
- [x] `apps/web/src/` — main.jsx + App.jsx + modules/, pages/, components/, hooks/, api/, store/, lib/.
- [x] `apps/desktop/src/` — main.jsx + App.jsx + bridge/ + estructura web + src-tauri/.
- [x] `apps/worker/src/config/env.validation.ts` — validacion de entorno.

### Documentacion y ADRs
- [x] `docs/09-adr/README.md` — indice de ADRs.
- [x] ADR-001: Estructura del monorepo — aprobado.
- [x] ADR-002: Stack tecnologico — aprobado.
- [x] ADR-003: Modular monolith — aprobado.
- [x] ADR-004: Arquitectura de sync — aprobado.
- [x] `docs/02-architecture/18-referencia-env-vars.md` — catalogo completo.

### Infraestructura local
- [x] `infra/docker/docker-compose.dev.yml` — postgres:16 + redis:7 + minio con healthchecks.
- [x] `tools/bootstrap.sh` — setup completo del entorno local.
- [x] `tools/reset-local.sh` — reset total con confirmacion.
- [x] `prisma/seeds/index.ts` — entry point de seeds.

## Declaracion de cierre de Fase 3

Con T-0340 aprobada, la **Fase 3 — Monorepo, paquetes base y tooling** queda formalmente completada.

El baseline del monorepo AtlasERP esta listo para recibir las implementaciones de las Fases siguientes:

- **Fase 4**: Infraestructura Docker completa (staging, prod, Dockerfiles).
- **Fase 5**: Schema Prisma, modelos de datos, migraciones iniciales.
- **Fase 6**: Backend NestJS — AppModule, AuthModule, UsersModule, PrismaService.
- **Fase 7+**: Frontend, desktop, sync engine, design system, etc.

## Estado al cierre

| Componente                | Estado   |
| ------------------------- | -------- |
| Monorepo estructura       | Listo    |
| Tooling (lint/format/git) | Listo    |
| Scripts (raíz + apps)     | Listos   |
| Env vars (ejemplos + validacion) | Listos |
| Estructura de apps (src/) | Lista (stub) |
| ADRs iniciales (001-004)  | Aprobados |
| Docker dev (3 servicios)  | Listo    |
| Seeds entry point         | Listo    |
