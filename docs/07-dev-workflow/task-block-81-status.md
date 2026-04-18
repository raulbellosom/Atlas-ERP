# Task Block 81 Status — Fase 10 Bloque 5

## Identificacion
- Bloque: `Bloque 5`
- Fase: `Fase 10`
- Tasks: `T-1020` a `T-1024`
- Estado: `CERRADO`
- Fecha de cierre: `2026-04-13`

## Tasks del bloque

| Task | Titulo | Estado |
|------|--------|--------|
| T-1020 | Implementar persistencia backend de SyncItem | CERRADA |
| T-1021 | Implementar persistencia backend de ConflictRecord | CERRADA |
| T-1022 | Implementar persistencia backend de ConflictResolution | CERRADA |
| T-1023 | Implementar logs de sync | CERRADA |
| T-1024 | Implementar comparador de versiones local/server | CERRADA |

## Entregables (todos en `apps/api/src/modules/sync/sync.service.ts`)

- `computePayloadHash(payload)` — FNV-1a 32-bit hash de payload estable (T-1024)
- `comparePayloads(local, server) → PayloadDiff` — comparador con changedKeys (T-1024)
- `SAFE_AUTO_RESOLVE_ENTITIES` — set de entidades LWW (setting, feature_flag, device_registry) (T-1022)
- `writeSyncLog(params)` — helper no-blocking para SyncLog con source=SYNC_ENGINE (T-1023)
- `processSingleItem()` refactorizado — idempotencia correcta, status semántico, ConflictRecord, auto-resolución, SyncLog (T-1020/T-1021/T-1022/T-1023)
- `autoResolveConflict()` — transacción atómica: ConflictRecord→RESOLVED + ConflictResolution(AUTO_RESOLVED) + SyncItem→APPLIED (T-1022)
- `processBatch()` — SyncLog SESSION_STARTED/SESSION_COMPLETED, status COMPLETED_WITH_CONFLICTS diferenciado (T-1019/T-1023)

## Validaciones
- pnpm --filter api lint: OK
- pnpm --filter api typecheck: OK
