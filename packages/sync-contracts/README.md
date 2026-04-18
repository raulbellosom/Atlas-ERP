# @atlasrep/sync-contracts

Contrato base de sincronización para AtlasERP.

## Alcance actual
- Tipos oficiales de entidades sincronizables.
- Tipos oficiales de operaciones sincronizables.
- Versionado oficial del payload (`semver`).
- Builder y validador básico del payload batch.
- Estrategia base de cola local.
- Estrategia base de retries.
- Estrategia base de idempotencia.
- Estrategia base de detección de duplicados.
- Estrategia base de conflictos.
- Estrategia base de aprobación/rechazo.
- Reglas base por entidad para operación offline.

## Exportaciones principales
- `SYNC_ENTITY_TYPES`
- `SYNC_OPERATION_TYPES`
- `SYNC_PAYLOAD_VERSION_CURRENT`
- `SYNC_PAYLOAD_VERSION_SUPPORTED`
- `SYNC_VERSION_POLICY`
- `SYNC_ITEM_SOURCES`
- `SYNC_QUEUE_POLICY`
- `SYNC_QUEUE_STATES`
- `SYNC_RETRY_POLICY`
- `SYNC_IDEMPOTENCY_POLICY`
- `SYNC_DUPLICATE_POLICY`
- `SYNC_CONFLICT_POLICY`
- `SYNC_CONFLICT_TYPES`
- `SYNC_APPROVAL_DECISIONS`
- `SYNC_APPROVAL_POLICY`
- `OFFLINE_ENTITY_RULES`

## Helpers principales
- `buildSyncBatchPayload(params)`
- `validateSyncBatchPayload(payload)`
- `validateSyncItem(item)`
- `pickQueueBatch(items, maxBatchSize)`
- `canTransitionQueueState(fromState, toState)`
- `computeRetryDelay(attempt, policy)`
- `shouldRetryAttempt(params, policy)`
- `buildIdempotencyKey(params)`
- `isValidIdempotencyKey(key)`
- `createDuplicateFingerprint(item)`
- `isDuplicateCandidate(existingItem, incomingItem)`
- `classifyConflict(params)`
- `requiresManualConflictResolution(params)`
- `resolveApprovalDecision(params)`
- `isSyncApprovalDecision(value)`
- `canOperateOffline(entity, operation)`
- `getOfflineRuleForEntity(entity)`

## Nota
Este paquete establece baseline contractual de Sync Core. Los bloques siguientes de Fase 10 implementarán ejecución operativa de cola, persistencia SQLite, procesamiento batch y resolución asistida end-to-end.
