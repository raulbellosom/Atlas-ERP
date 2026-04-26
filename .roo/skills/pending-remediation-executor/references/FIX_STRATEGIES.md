# Fix Strategies by Category

## Backend API Fixes (NestJS)

### MinIO/Storage Fixes (T-0632, T-0633, T-0634)

**Pattern**: Infrastructure layer configuration

- Check `apps/api/src/modules/storage/` or create if missing
- Use `@atlaserp/config` for shared ESLint/Prettier
- Validate environment variables: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`,
  `MINIO_SECRET_KEY`, `MINIO_BUCKET`
- Use Prisma service layer pattern with repository pattern
- Run `pnpm --filter=@atlaserp/api lint` and
  `pnpm --filter=@atlaserp/api typecheck` after changes

### Decorator/Scope Fixes (T-0625)

**Pattern**: Custom NestJS decorators

- Create decorators in `apps/api/src/common/decorators/`
- Use `@Injectable()` with scoped providers
- Metadata extraction from request headers/REST
- Apply `@CurrentOrganization()` and `@CurrentBranch()` param decorators

### Pagination/Filters (T-0628, T-0629)

**Pattern**: Reusable DTO and service layer

- Create pagination layer in shared/common layer
- Apply to at least one module (SyncModule as mentioned)
- Use class-validator DTOs with pipeline global validation
- Ensure no breaking changes to existing endpoint contracts

### Device Registry (T-0706)

**Pattern**: Model extension and endpoint enrichment

- Extend existing DeviceRegistry model in Prisma schema
- Enrich GET /v1/sessions response with userAgent and ipAddress
- No new endpoints required - extend existing

### Rate Limiting (T-0722)

**Pattern**: Custom guard without external dependencies

- Implement in-memory rate limit using Map with TTL
- Create `@RateLimit()` decorator available for any endpoint
- Register as APP_GUARD in NestJS bootstrap
- Note: Production multi-instance requires Redis replacement

### SyncSession Persistence (T-1019)

**Pattern**: Service layer with batch processing

- Modify `SyncService.processBatch()` to create/close SyncSession
- Ensure counters updated correctly
- Register audit action via `auditAction()` in audit module

## Frontend Web Fixes (React)

### Users/Roles UI (T-0814)

**Pattern**: Table with real backend data

- Use existing API endpoints for users and roles
- Handle states: loading, empty, error
- Radix UI for accessible components
- TailwindCSS 4.1 styling (no Bootstrap)
- Pending: add frontend pagination (currently loads all)

## Desktop App Fixes (Tauri)

### Build Configuration (T-0902)

**Pattern**: Tauri build commands

- `pnpm --filter=@atlaserp/desktop build:web` for embedded web build
- `pnpm --filter=@atlaserp/desktop build` for Tauri packaging
- Note: Requires Rust toolchain (cargo) for native build

### Secure Storage (T-0905)

**Pattern**: Tauri commands with encryption

- Create Rust commands in `apps/desktop/src-tauri/src/commands.rs`
- Use OS keychain/secure storage (Stronghold on Linux, Keychain on macOS)
- Expose JS bridge for set/get/remove operations
- Pending: hardening with OS-level secrets

### Export/Print Bridge (T-0908)

**Pattern**: Tauri command registration

- CSV export via Tauri command
- JSON export via Tauri command
- Basic print API registered for native integration later

### Update Bridge (T-0910)

**Pattern**: Contract definition only

- Define state contract for updater
- Define check-updates contract
- Don't implement actual update logic yet
- Expose bridge consumable from desktop frontend

### Sync Queue Repository (T-0914)

**Pattern**: Local SQLite repository

- Create enqueue/listing operations for sync queue
- Implement state transitions (pending â†’ processing â†’ completed/failed)
- JS repository reusable by sync module
- Pending: retry/backoff strategy and dead-letter queue

### Auth Boot (T-0916)

**Pattern**: App boot with session detection

- Detect active local session on startup
- Transition app to authenticated mode
- Centralize logic in reusable hook
- Pending: integration with real auth tokens from backend

### Offline Boot (T-0917)

**Pattern**: Offline-first boot flow

- Detect network unavailability
- Use local credentials/profile for offline mode
- Reflect offline state in shell UI
- Pending: formal expiration/reauth policy for prolonged offline

## Common Patterns

### Validation Commands

```bash
# API (NestJS)
pnpm --filter=@atlaserp/api lint
pnpm --filter=@atlaserp/api typecheck
pnpm --filter=@atlaserp/api build

# Web (React)
pnpm --filter=@atlaserp/web lint
pnpm --filter=@atlaserp/web build

# Desktop (Tauri)
pnpm --filter=@atlaserp/desktop lint
```

### Status Update Pattern

Update CSV columns:

- `status`: OPEN â†’ IN_PROGRESS â†’ CLOSED
- `last_updated`: ISO 8601 date (e.g., 2026-04-21)

### Dependencies

- T-0632 (MinIO) â†’ T-0633 (upload) â†’ T-0634 (download)
- T-0628 (pagination) â†’ T-0629 (filters)
- T-0618 closed before T-0619
- T-0624 closed before T-0625
- T-0705 closed before T-0706

## Encoding Requirements

All modified files must be UTF-8 encoded. Check with:

```bash
file --mime-encoding <file>
```

