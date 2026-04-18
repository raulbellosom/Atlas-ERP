# Task Block 85 Status - Fase 10 Bloque 8

## Identificación
- Bloque: `Bloque 8`
- Fase: `Fase 10`
- Tasks: `T-1035` a `T-1039`
- Estado: `CERRADO`
- Fecha de cierre: `2026-04-13`

## Tasks del bloque

| Task | Título | Estado |
|------|--------|--------|
| T-1035 | Implementar acciones de aprobar local | CERRADA |
| T-1036 | Implementar acciones de conservar servidor | CERRADA |
| T-1037 | Implementar acciones de descartar local | CERRADA |
| T-1038 | Implementar acciones de merge manual | CERRADA |
| T-1039 | Implementar permisos para resolución de conflictos | CERRADA |

## Entregables

### `apps/desktop/src/modules/sync/localConflictResolutionService.js` (nuevo)
- Acciones formales de resolución local:
  - `APPROVE_LOCAL`
  - `KEEP_SERVER`
  - `DISCARD_LOCAL`
  - `MERGE_MANUAL`
- Reencola item cuando la resolución requiere retry (`APPROVE_LOCAL`, `MERGE_MANUAL`).
- Cancela item original y conserva razón de resolución.
- Si existe `conflictId` en `lastError`, intenta sincronizar resolución en backend.

### `apps/desktop/src/modules/sync/syncConflictApi.js` (nuevo)
- Cliente mínimo para `PATCH /v1/sync/conflicts/:id/resolve`.
- Manejo seguro cuando falta token o `apiUrl` (no-op controlado).

### `apps/desktop/src/modules/sync/conflictPermissions.js` (nuevo)
- Regla de acceso para resolver conflictos basada en sesión local.
- Soporte por rol y por llaves de permiso explícitas.
- Mensaje estándar para UI cuando no hay autorización.

### `apps/desktop/src/components/sync/ConflictDetailPanel.jsx` (actualizado)
- Mantiene panel de detalle (`T-1034`) y agrega acciones de resolución (`T-1035..T-1038`).
- Flujo de merge manual con editor JSON y validación.
- Control de permisos (`T-1039`): bloquea acciones y muestra mensaje de acceso.

### `apps/desktop/src/components/sync/SyncCenterTabs.jsx` (actualizado)
- Recibe sesión desde `App` para evaluar permisos.
- Banner contextual en tab de conflictos cuando no hay permiso.
- Soporte de recarga automática (`reloadToken`) tras resolver conflicto.

### `apps/desktop/src/modules/sync/syncWorker.js` (actualizado)
- Incluye `conflictId` en `lastError` cuando backend lo reporta, habilitando cierre remoto posterior.

### `apps/desktop/src/App.jsx` (actualizado)
- Pasa `session` hacia `<SyncCenterTabs session={state.session} />`.

## Validaciones
- `pnpm.cmd --filter @atlasrep/desktop run lint`: OK
- `pnpm.cmd --filter @atlasrep/desktop run build:web`: OK (57 módulos, build exitoso)
