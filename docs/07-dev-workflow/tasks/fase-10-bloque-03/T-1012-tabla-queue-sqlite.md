# T-1012 - Implementar tabla/local storage de queue en SQLite

## Metadatos
- ID: `T-1012`
- Fase: `Fase 10`
- Bloque: `Bloque 3`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Implementar almacenamiento SQLite contractual para items de sync con soporte de idempotencia, aprobación y estado operativo.

## Implementación
- Se agregó migración local `004_sync_queue_items_table` en `apps/desktop/src-tauri/src/commands.rs`.
- Nueva tabla `sync_queue_items` con campos:
  - `item_id`, `entity`, `entity_id`, `operation`, `payload_json`
  - `source`, `occurred_at`, `idempotency_key`, `fingerprint`
  - `approval_status`, `approval_reason`
  - `status`, `attempts`, `priority`, `retry_at`, `last_error`
  - `created_at`, `updated_at`
- Se agregaron índices para estado/prioridad, idempotency y entidad.

## Criterios de aceptación
- [x] Tabla SQLite contractual creada por migración.
- [x] Índices mínimos de consulta y deduplicación implementados.
- [x] Migración ejecutable vía bootstrap/migraciones locales.

## Evidencia
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src-tauri/src/lib.rs`
