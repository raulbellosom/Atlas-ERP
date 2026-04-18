# T-1507 - Crear enqueue local de movimientos offline

## Metadatos
- ID: `T-1507`
- Fase: `Fase 15`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el flujo completo de creación de movimientos financieros en modo offline: guardar el movimiento en la cola de sync local (SQLite), refleja el estado en el caché local de movimientos, y procesarlo al reconectar mediante el Sync Core del desktop.

## Alcance
- Crear `useCreateMovementDesktop()` mutation hook:
  - Online: llama directamente a `POST /api/v1/financial-movements` (comportamiento estándar).
  - Offline: genera UUID local → encola en `finops_sync_queue` con `entityType: 'financial_movement'`, `operation: 'create'`, `payload: JSON.stringify(dto)` → inserta en `finops_movements_cache` con `status: 'PENDING_SYNC'`.
  - Retorna de forma idéntica en ambos modos para que la UI no necesite bifurcar.
- Crear handler de sync en el Sync Core desktop:
  - `finops-movement-create.handler.ts`: al desencolar, llama a `POST /api/v1/financial-movements`, actualiza el registro del caché con el `id` real del backend, cambia `status` a `SYNCED`.
- Registrar el handler en el `SyncCore` bajo el tipo `'financial_movement.create'`.
- Integrar `useCreateMovementDesktop` en `CreateMovementFormDesktop`.

## Fuera de alcance
- Edición y eliminación de movimientos offline (no permitido — T-1501).
- Adjuntos de movimientos offline (T-1513).
- Reintentos con backoff (el Sync Core ya implementa la política de reintentos de T-0914).

## Dependencias
- `T-1502`: tabla `finops_sync_queue` y `finops_movements_cache` disponibles.
- `T-1504`: caché local de movimientos implementado — el enqueue escribe en él.
- `T-1506`: formulario desktop disponible para integrar el hook.
- `T-0913` a `T-0914`: Sync Core con cola y procesamiento implementado.

## Criterios de aceptación
- [x] `useCreateMovementDesktop` implementado en `apps/desktop/src/modules/finops/hooks/useCreateMovementDesktop.js` — funciona en online y offline.
- [x] Offline: genera UUID local → encola en `sync_queue_items` → inserta en `finops_movements_cache` con `status: 'PENDING_SYNC'`.
- [x] Handler `finopsMovementCreateHandler` creado en `apps/desktop/src/modules/finops/sync/finopsMovementCreateHandler.js` — actualiza caché tras sync.
- [x] `pnpm --filter @atlasrep/desktop run lint`: 0 errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: offline → crear movimiento → visible en lista → reconectar → sync automático → badge desaparece.

## Pruebas
- Crear movimiento en offline → `finops_sync_queue` tiene 1 registro → `finops_movements_cache` tiene el movimiento con `status: 'PENDING_SYNC'`.
- Reconectar → Sync Core procesa la cola → `POST /api/v1/financial-movements` llamado → `finops_movements_cache` actualizado con id real → `status: 'SYNCED'`.
- Error de API al sincronizar (ej. validación) → registro en cola marcado como `ERROR` → usuario ve badge `SYNC_ERROR` con opción de reintentar.

## Riesgos
- **Movimiento duplicado si el sync falla a medias**: si la llamada a `POST` tiene éxito pero falla la actualización del caché local, el próximo retry enviará el movimiento de nuevo al backend. Mitigación: el backend usa idempotency key derivada del UUID local para detectar duplicados.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/hooks/useCreateMovementDesktop.ts` — archivo nuevo.
- `apps/desktop/src/modules/finops/sync/finops-movement-create.handler.ts` — archivo nuevo.

## Decisiones clave
- **Idempotency key = UUID local**: el UUID generado localmente se envía como header `Idempotency-Key` en la llamada al backend. Si el backend ya recibió ese UUID (movimiento ya sincronizado), retorna el registro existente en lugar de crear uno duplicado.
- **Interfaz idéntica online/offline**: `useCreateMovementDesktop` retorna la misma interfaz que `useMutation` de react-query, independientemente del modo. Esto permite que el formulario no necesite conocer si está en modo online u offline.

## Evidencia documental
- `apps/desktop/src/modules/finops/hooks/useCreateMovementDesktop.ts`
- `apps/desktop/src/modules/finops/sync/finops-movement-create.handler.ts`

## Pendientes para la siguiente task
- `T-1508` implementa el enqueue para transferencias offline.

## Pendientes no resueltos
- Ninguno.
