# AGENTS.md - Ask Mode Rules

This file provides non-obvious documentation context specific to AtlasERP.

## Documentation Rules (Non-Obvious Only)

### Project Structure Context

- **"apps/" contains VSCode extension code** - actually this is misleading;
  apps/ contains: api (NestJS backend), web (React frontend), desktop (Tauri
  app), worker (NestJS/BullMQ jobs)
- **Project language is Spanish (MX)** - documentation, comments, variable names
  are in Spanish
- **"packages/"** contains: ui (shared components), config (ESLint/Prettier),
  shared (constants/enums), sync-contracts (sync logic), validation (Zod
  schemas), sdk (API client)

### Key Documentation Files

- `CODEX_START_HERE.md` - main entry point with project vision and rules
- `docs/04-modules/00-politica-ownership-datos.md` - mandatory for any new
  entity
- `docs/05-sync/` - sync architecture documentation (13 files covering offline,
  conflicts, queue, etc.)
- `monorepo-structure.txt` - directory layout reference

### Architecture Context

- Monorepo using pnpm workspaces + turbo
- Server is source of truth - SQLite local never replaces PostgreSQL central
- Sync is controlled, not free offline - conflicts must be resolvable
- Modular monolith design with growth by modules (Accounting, HR, Purchases,
  Inventory, CRM)

### Codebase Surprises

- `packages/config/` contains shared ESLint/Prettier configs used by all apps
- Prisma schema is single (`prisma/schema.prisma`) not per-app
- Radix UI is used for accessible components, not Material UI or Chakra
