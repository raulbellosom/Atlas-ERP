# AGENTS.md - Architect Mode Rules

This file provides non-obvious architectural constraints specific to AtlasERP.

## Architecture Rules (Non-Obvious Only)

### Core Architectural Decisions

- **Server is source of truth** - local SQLite (desktop) never replaces
  PostgreSQL central
- **Sync is controlled, not free offline** - conflicts must be resolvable
  (approve/discard/merge)
- **No automatic merges in sensitive data** - human decision required for
  financial/HR data conflicts

### Sync Architecture

- Sync contracts live in `packages/sync-contracts/src/` (entities, operations,
  conflicts, duplicates, idempotency, retries, queue, versioning)
- Offline rules defined per-entity in
  `packages/sync-contracts/src/offlineRules.js`
- Sync conflicts can be: approve local, keep server, discard local, or manual
  merge

### Module Constraints

- **No module without ownership policy** - see
  `docs/04-modules/00-politica-ownership-datos.md`
- **Every module must declare sync policy** - required for any new module
- Modules planned: Accounting Core, HR Core, Purchases Core, Inventory Core, CRM
  Core

### UI Architecture

- **No Bootstrap** - TailwindCSS 4.1 only
- Radix UI primitives for accessible components
- Every screen must handle: loading, empty, error, offline, sync-pending states
- Premium, professional, clean design aesthetic

### Database

- Single Prisma schema at `prisma/schema.prisma` (not per-app)
- PostgreSQL central database with SQLite local for desktop offline
- All entities require ownership policy defined

### Tech Stack

- Monorepo: pnpm workspaces + turbo
- Backend: NestJS + TypeScript + Prisma + PostgreSQL + BullMQ/Redis
- Frontend: React + Vite + TailwindCSS 4.1 + Radix UI
- Desktop: Tauri + React + SQLite local
