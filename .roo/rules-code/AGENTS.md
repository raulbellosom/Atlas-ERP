# AGENTS.md - Code Mode Rules

This file provides non-obvious coding guidance specific to AtlasERP.

## Coding Rules (Non-Obvious Only)

### Imports & Dependencies

- **UTF-8 encoding is mandatory** - all files must be UTF-8 encoded; corrupted
  text must be fixed before committing
- **Use @atlaserp/config** for shared ESLint/Prettier configs - don't redefine
  rules in individual apps

### Sync Architecture

- Sync contracts in `packages/sync-contracts/src/` define entities, operations,
  conflicts, duplicates, idempotency, retries, queue, versioning
- **Offline rules defined per-entity** in
  `packages/sync-contracts/src/offlineRules.js` - must be updated when adding
  new sync entities
- **Server is source of truth** - local SQLite in desktop app never replaces
  PostgreSQL

### Module Development

- **No module without ownership policy** - see
  `docs/04-modules/00-politica-ownership-datos.md`
- **No Bootstrap** - TailwindCSS 4.1 only
- **Every screen must handle**: loading, empty, error, offline, sync-pending
  states

### Database

- Single Prisma schema at `prisma/schema.prisma` (not per-app)
- Database migrations in `prisma/migrations/`
- Seeds in `prisma/seeds/`

### UI Components

- Use Radix UI primitives (already in dependencies)
- Use Lucide or Phosphor icons
- Premium, professional, clean design

