# Estado de Ejecución - Fase 3 / Bloque 5

## Contexto
- Fecha de cierre de bloque: **2026-04-12**
- Fase 3: Monorepo, paquetes base y tooling
- Bloque 5: Migraciones, resets, release notes, estructura oficial backend y frontend

## Estado del bloque
- Bloque `T-0320` a `T-0324`: **CERRADO**

## Estado por task

| ID     | Título                                          | Estado  | Evidencia                                                                                             |
| ------ | ----------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| T-0320 | Configurar scripts para migraciones             | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-05/T-0320-scripts-migraciones.md`                          |
| T-0321 | Configurar scripts para resets locales          | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-05/T-0321-scripts-reset-local.md`                          |
| T-0322 | Configurar scripts para release notes           | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-05/T-0322-scripts-release-notes.md`                        |
| T-0323 | Crear estructura de carpetas oficial del backend | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-05/T-0323-estructura-backend.md`                           |
| T-0324 | Crear estructura de carpetas oficial del frontend | Cerrada | `docs/07-dev-workflow/tasks/fase-03-bloque-05/T-0324-estructura-frontend.md`                         |

## Archivos creados en este bloque

### Migración y BD
- `apps/api/package.json` — scripts completos: migrate/prod/status/create, generate, studio
- `package.json` (raíz) — proxies db:migrate:prod, db:migrate:status, db:generate, db:studio

### Reset local
- `tools/reset-local.sh` — reset total: Docker volumes + migrate + seed (con confirmación)
- `package.json` (raíz) — script `reset:local`

### Release notes
- `.changeset/config.json` — configuración de Changesets para monorepo
- `package.json` (raíz) — scripts `changeset`, `version-packages`, `release:notes`

### Estructura oficial del backend (`apps/api/src/`)
- `main.ts` — entry point NestJS
- `modules/`, `common/decorators/`, `common/filters/`, `common/guards/`
- `common/interceptors/`, `common/pipes/`, `config/`
- `infrastructure/prisma/`, `infrastructure/redis/`, `infrastructure/storage/`

### Estructura oficial del frontend (`apps/web/src/`)
- `main.jsx` — entry point React
- `App.jsx` — root component (stub)
- `assets/index.css` — CSS global con directivas Tailwind
- `modules/`, `pages/`, `components/ui/`, `components/layout/`
- `hooks/`, `api/`, `store/`, `lib/`

## Siguiente bloque
**Fase 3 / Bloque 6** (`T-0325` a `T-0329`): Estructura de desktop y tools, estándares de env vars, `.env.example` raíz y por app, validación de env vars en backend.
