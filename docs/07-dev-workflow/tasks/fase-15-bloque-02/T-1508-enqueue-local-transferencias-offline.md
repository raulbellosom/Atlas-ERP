# T-1508 - Crear enqueue local de transferencias offline

## Metadatos
- ID: `T-1508`
- Fase: `Fase 15`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el flujo de creación de transferencias bancarias en modo offline, encolando la operación para sincronización posterior y reflejando el estado en el caché local con las restricciones específicas del proceso de aprobación.

## Alcance
- Crear `useCreateTransferDesktop()` mutation hook:
  - Online: llama a `POST /api/v1/transfers` directamente.
  - Offline: genera UUID local → encola en `finops_sync_queue` con `entityType: 'financial_transfer'`, `operation: 'create'`, `payload` con el DTO → inserta en `finops_transfers_cache` con `status: 'PENDING_SYNC'`.
- Restricción de aprobación en offline: la transferencia creada offline se encola con `status: 'PENDING'` (requiere aprobación online). El botón de aprobación queda bloqueado hasta sincronizar (T-1514).
- Handler `finops-transfer-create.handler.ts` en el Sync Core:
  - Al desencolar: `POST /api/v1/transfers` con idempotency key.
  - Actualizar caché con id real y `status: 'PENDING'` (pendiente de aprobación en el backend).
- Integrar `useCreateTransferDesktop` en `CreateTransferWizardDesktop`.

## Fuera de alcance
- Aprobación o rechazo de transferencias offline (operación bloqueada — T-1501).
- Enqueue de edición de transferencias (no permitido en offline).

## Dependencias
- `T-1502`: tabla `finops_sync_queue` y `finops_transfers_cache` disponibles.
- `T-1507`: patrón de enqueue de movimientos establecido — se replica para transferencias.
- `T-1411`: `CreateTransferWizard` web como base.
- `T-1506`: `CreateTransferWizardDesktop` con persistencia local disponible.

## Criterios de aceptación
- [x] `useCreateTransferDesktop` implementado en `apps/desktop/src/modules/finops/hooks/useCreateTransferDesktop.js`.
- [x] Offline: UUID local → encola en `sync_queue_items` → inserta en `finops_transfers_cache` con `PENDING_SYNC`.
- [x] Handler `finopsTransferCreateHandler` creado en `apps/desktop/src/modules/finops/sync/finopsTransferCreateHandler.js` — al sync queda `PENDING` (aprobación requerida online).
- [x] `pnpm --filter @atlasrep/desktop run lint`: 0 errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: offline → wizard de transferencia → transferencia en lista con badge → reconectar → sync → badge cambia a `PENDING` (pendiente de aprobación en el servidor).

## Pruebas
- Offline: wizard de 3 pasos completado → transferencia en cola + en caché `PENDING_SYNC`.
- Reconectar → handler llamado → `POST /api/v1/transfers` exitoso → transferencia con id real y `status: PENDING`.
- Botón "Aprobar" oculto mientras `PENDING_SYNC` → visible (pero deshabilitado offline) una vez sincronizada como `PENDING`.

## Riesgos
- **Saldo insuficiente detectado al sincronizar**: si el usuario crea una transferencia offline y al sincronizar el saldo es insuficiente (alguien más movió fondos), el backend rechaza con error. El item de cola queda en estado `ERROR` y el usuario recibe notificación. Mitigación: mostrar saldo del caché en el wizard como "Saldo aproximado" con advertencia.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/hooks/useCreateTransferDesktop.ts` — archivo nuevo.
- `apps/desktop/src/modules/finops/sync/finops-transfer-create.handler.ts` — archivo nuevo.

## Decisiones clave
- **Transferencia offline = PENDING inmediato**: una transferencia creada offline nunca puede ser aprobada offline. Al sincronizar, queda como `PENDING` en el backend, esperando aprobación online. Esto es consistente con el flujo de control financiero del negocio.
- **Mostrar saldo como "aproximado" en el wizard offline**: el wizard desktop muestra el saldo desde el caché con el label "Saldo aproximado" y una nota "Saldo al [fecha de sync]" para que el usuario entienda que el balance podría no estar actualizado.

## Evidencia documental
- `apps/desktop/src/modules/finops/hooks/useCreateTransferDesktop.ts`
- `apps/desktop/src/modules/finops/sync/finops-transfer-create.handler.ts`

## Pendientes para la siguiente task
- `T-1509` implementa el enqueue para CxC y CxP simples offline.

## Pendientes no resueltos
- Ninguno.
