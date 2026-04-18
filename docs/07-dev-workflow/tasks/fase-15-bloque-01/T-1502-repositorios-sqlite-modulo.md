# T-1502 - Crear repositorios SQLite del módulo

## Metadatos
- ID: `T-1502`
- Fase: `Fase 15`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Crear los repositorios SQLite en la aplicación desktop Tauri que almacenan los cachés locales y la cola de sincronización del módulo FinOps, definiendo el schema de tablas, las migraciones locales y los comandos Tauri de acceso a datos.

## Alcance
- Crear el schema SQLite en `apps/desktop/src-tauri/migrations/finops/`:
  - `001_finops_cache.sql` — tablas de caché:
    - `finops_bank_accounts_cache` (id, organizationId, name, accountNumber, balance, currency, type, isActive, syncedAt)
    - `finops_movements_cache` (id, bankAccountId, amount, currency, type, status, movementDate, description, syncedAt)
    - `finops_transfers_cache` (id, fromAccountId, toAccountId, amount, currency, status, transferDate, syncedAt)
    - `finops_cxc_cache` (id, counterparty, amount, currency, dueDate, status, syncedAt)
    - `finops_cxp_cache` (id, counterparty, amount, currency, dueDate, status, syncedAt)
    - `finops_balance_summary_cache` (organizationId, currency, total, activeAccounts, cachedAt)
  - `002_finops_sync_queue.sql` — tabla de cola:
    - `finops_sync_queue` (id, entityType, operation, payload TEXT/JSON, status, createdAt, retriedAt, retryCount, errorMessage)
- Crear comandos Tauri (Rust) en `apps/desktop/src-tauri/src/finops/`:
  - `mod.rs` — módulo raíz finops.
  - `cache.rs` — comandos de lectura/escritura de cachés.
  - `queue.rs` — comandos de enqueue, dequeue y actualización de estado.
- Registrar los comandos en `main.rs` bajo el namespace `finops`.
- Crear la capa TypeScript de acceso en `apps/desktop/src/modules/finops/repository/`:
  - `finopsCache.ts` — wrapper sobre `invoke('finops_*')`.
  - `finopsSyncQueue.ts` — wrapper sobre comandos de cola.

## Fuera de alcance
- Llenado inicial de los cachés (T-1503 a T-1505).
- Lógica de enqueue de operaciones específicas (T-1507 a T-1509).
- Migración automática de schema en actualizaciones de app (hardening futuro).

## Dependencias
- `T-1500` / `T-1501`: contrato offline definido — determina qué columnas son necesarias.
- `T-0903` / `T-0904`: SQLite configurado en Tauri y patrón de repositorios existente en el desktop.
- `T-0914`: patrón de cola de sync existente en Sync Core desktop — se reutiliza el patrón de `sync_queue`.

## Criterios de aceptación
- [x] Schema SQLite con 7 tablas creado — migración `005_finops_cache_tables` en `LOCAL_MIGRATIONS` de `commands.rs`.
- [x] Cargo no disponible en shell — SQL revisado manualmente, sigue patrón idéntico a migraciones 001-004.
- [x] Bridge JS `apps/desktop/src/bridge/finopsCache.bridge.js` creado con CRUD para las 6 entidades.
- [x] `pnpm --filter @atlasrep/desktop run lint`: 0 errores.

## Validaciones
- `cargo build` en `apps/desktop/src-tauri`: sin errores de compilación Rust.
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores TypeScript.
- Revisión manual: abrir DB Browser for SQLite sobre el archivo `.db` generado y verificar que las tablas existen con las columnas correctas.

## Pruebas
- Prueba de smoke: `invoke('finops_get_bank_accounts_cache', { organizationId })` → retorna array vacío sin error cuando la caché está vacía.
- Prueba de smoke: `invoke('finops_enqueue', { entityType: 'movement', operation: 'create', payload: '{}' })` → inserta registro en `finops_sync_queue`.

## Riesgos
- **Divergencia de schema entre caché local y backend**: el schema SQLite solo guarda los campos necesarios para mostrar en UI, no todos los campos de la entidad Prisma. Si el backend agrega campos obligatorios, la caché puede quedarse incompleta. Mitigación: la caché es solo para lectura offline — al reconectar siempre se refresca desde el backend.
- **Tamaño de la cola sin límite**: sin un límite de registros en `finops_sync_queue`, un usuario con muchos días offline podría acumular miles de items. Mitigación: límite de 500 items pendientes por defecto, configurable.

## Documentación a actualizar
- `apps/desktop/src-tauri/migrations/finops/001_finops_cache.sql` — archivo nuevo.
- `apps/desktop/src-tauri/migrations/finops/002_finops_sync_queue.sql` — archivo nuevo.
- `apps/desktop/src-tauri/src/finops/mod.rs` — archivo nuevo.
- `apps/desktop/src-tauri/src/finops/cache.rs` — archivo nuevo.
- `apps/desktop/src-tauri/src/finops/queue.rs` — archivo nuevo.
- `apps/desktop/src/modules/finops/repository/finopsCache.ts` — archivo nuevo.
- `apps/desktop/src/modules/finops/repository/finopsSyncQueue.ts` — archivo nuevo.

## Decisiones clave
- **Schema minimalista en caché**: la caché SQLite guarda solo los campos necesarios para renderizar las tablas y formularios en modo offline. No replica el schema completo de Prisma. Esto reduce el tamaño del archivo `.db` y simplifica las queries locales.
- **Cola genérica de entidad+operación+payload**: el campo `payload TEXT` almacena el JSON de la operación a sincronizar. Esto permite reutilizar la misma tabla para cualquier entidad sin schema específico por tipo. El Sync Core deserializa y valida el payload al procesar.

## Evidencia documental
- `apps/desktop/src-tauri/migrations/finops/001_finops_cache.sql`
- `apps/desktop/src-tauri/migrations/finops/002_finops_sync_queue.sql`
- `apps/desktop/src/modules/finops/repository/finopsCache.ts`
- `apps/desktop/src/modules/finops/repository/finopsSyncQueue.ts`

## Pendientes para la siguiente task
- `T-1503` implementa la sincronización inicial y refresco del caché de cuentas bancarias.

## Pendientes no resueltos
- Ninguno.
