# AGENTS.md - Debug Mode Rules

This file provides non-obvious debugging guidance specific to AtlasERP.

## Debug Rules (Non-Obvious Only)

### Sync Debugging

- Sync contracts and offline rules in
  `packages/sync-contracts/src/offlineRules.js`
- Use `pnpm --filter=@atlaserp/api test:sync-core` for sync core tests
- Conflicts must be resolvable (approve/discard/merge) - never automatic merges
  in sensitive data

### Database Debugging

- Run `pnpm db:studio` to open Prisma Studio for visual database inspection
- `pnpm infra:logs` to follow Docker Compose logs for backend services

### API Debugging

- API runs on NestJS with Pino logger - check logs in terminal running
  `pnpm --filter=@atlaserp/api dev`
- PostgreSQL, Redis, and MinIO services run in Docker - check with
  `pnpm infra:status`

### Desktop Debugging

- Tauri desktop app uses SQLite for local offline - data in
  `apps/desktop/src-tauri/`
- Use `pnpm --filter=@atlaserp/desktop test:sync-core` for local sync tests

### Environment Variables

- Copy `.env.example` to `.env` in each app directory
- API requires `DATABASE_URL`, `JWT_SECRET`, `MINIO_*` variables

