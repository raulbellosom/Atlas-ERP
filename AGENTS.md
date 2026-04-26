# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

AtlasERP is a modular business platform with offline-first sync capabilities.
Main apps: `apps/api` (NestJS), `apps/web` (React), `apps/desktop` (Tauri),
`apps/worker` (NestJS/BullMQ).

## Critical Commands

### Running tests

```bash
# API (NestJS) - specific test types
pnpm --filter=@atlaserp/api test:unit           # Unit tests
pnpm --filter=@atlaserp/api test:integration    # Integration tests (runInBand)
pnpm --filter=@atlaserp/api test:e2e            # E2E tests (runInBand)
pnpm --filter=@atlaserp/api test:sync-core      # Sync core tests with tsx
pnpm --filter=@atlaserp/api test:finops-integration  # Finops integration tests

# Web (React) - Vitest
pnpm --filter=@atlaserp/web test                # Run tests once
pnpm --filter=@atlaserp/web test:watch           # Watch mode

# Desktop (Tauri)
pnpm --filter=@atlaserp/desktop test:sync-core  # Node native tests
```

### Database

```bash
pnpm db:migrate        # Run migrations (apps/api)
pnpm db:seed           # Seed database
pnpm db:studio         # Prisma Studio
pnpm db:reset          # Reset + reseed
```

### Docker services

```bash
pnpm infra:up          # Start Docker Compose dev services
pnpm infra:logs        # Follow logs
pnpm infra:status      # Container status
```

## Non-Obvious Patterns

### Encoding & Language

- **All files must be UTF-8 encoded** - check and fix corrupted text before
  committing
- **Documentation language is Spanish (MX)** - comments, docs, variable names in
  Spanish
- Source code comments are in Spanish

### Architecture Constraints

- **Server is source of truth** - local SQLite (desktop) never replaces
  PostgreSQL
- **Sync is controlled, not free offline** - conflicts must be resolvable
  (approve/discard/merge)
- **No module/entity without ownership policy** - see
  `docs/04-modules/00-politica-ownership-datos.md`

### Project-Specific Conventions

- **No Bootstrap** - use TailwindCSS 4.1 only
- **Every screen must handle**: loading, empty, error, offline, sync-pending
  states
- **Use commitlint** - commit messages must follow Conventional Commits (feat,
  fix, docs, etc.)
- **@atlaserp/config package** - shared ESLint/Prettier configs at
  `packages/config/`

### Sync Architecture

- Sync contracts live in `packages/sync-contracts/src/` (entities, operations,
  conflicts, duplicates, idempotency, retries, queue, versioning)
- Offline rules defined per-entity in
  `packages/sync-contracts/src/offlineRules.js`

### Prisma Schema

- Single schema at `prisma/schema.prisma` (not per-app)
- Migrations in `prisma/migrations/`
- Seeds in `prisma/seeds/`

