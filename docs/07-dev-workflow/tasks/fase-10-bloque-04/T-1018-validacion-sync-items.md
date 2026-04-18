# T-1018 - Implementar validación backend de sync items

## Metadatos
- ID: `T-1018`
- Fase: `Fase 10`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
- `dto/sync-batch-item.dto.ts`:
  - `itemId`, `entity`, `entityId`, `operation`, `payload`, `idempotencyKey` — obligatorios.
  - `entity` debe estar en `ALLOWED_SYNC_ENTITIES` (setting, feature_flag, attachment, device_registry, financial_movement, financial_transfer).
  - `operation` debe estar en `ALLOWED_SYNC_OPERATIONS` (create, update, upsert, delete).
  - `occurredAt` validado como ISO8601 si se envía.
- `dto/sync-batch-request.dto.ts`:
  - `items[]`: 1-100 items, `ValidateNested` con `@Type(() => SyncBatchItemDto)`.
  - `deviceRegistryId?`: opcional.
- `SyncService.processSingleItem()`:
  - Idempotencia: si ya existe SyncItem con `entityId === item.itemId` y status=SYNCED → retorna 'idempotent'.

## Criterios de aceptacion
- [x] Items con entity fuera de whitelist rechazados por class-validator.
- [x] Items duplicados retornan status='idempotent'.
- [x] typecheck OK.
