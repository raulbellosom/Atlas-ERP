# T-1511 - Crear recuperación local tras reinicio

## Metadatos
- ID: `T-1511`
- Fase: `Fase 15`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Garantizar que la aplicación desktop Tauri recupera correctamente el estado de la cola de sincronización FinOps y los borradores de formulario tras un reinicio o cierre inesperado, sin perder operaciones pendientes ni datos ingresados por el usuario.

## Alcance
- Implementar lógica de bootstrap en `apps/desktop/src-tauri/src/finops/boot.rs`:
  - Al iniciar la app: leer `finops_sync_queue` y cargar en memoria los ítems con `status: 'PENDING'` o `status: 'ERROR'`.
  - Emitir evento `finops:boot-recovery` con el conteo de ítems recuperados.
  - Si hay ítems en estado `SYNCING` (la app se cerró mientras sincronizaba): resetear su estado a `PENDING` para reintento.
- En el frontend React:
  - Hook `useFinOpsBootRecovery()` que escucha el evento `finops:boot-recovery`.
  - Si `count > 0`: mostrar notificación "Se recuperaron X operaciones pendientes de sync".
  - Abrir automáticamente el `FinOpsSyncQueuePanel` al detectar ítems recuperados.
- Borradores de formulario: al iniciar la app y detectar un borrador en `finops_form_drafts`, mostrar el banner "Tienes un borrador guardado" al navegar al formulario correspondiente (ya implementado en T-1506 — esta task agrega la recuperación al inicio).
- Prueba de crash-recovery: simular cierre abrupto con ítems en cola → reiniciar → verificar recuperación.

## Fuera de alcance
- Resolución automática de conflictos de sync (Fase 17+).
- Migración de borradores entre versiones de la app (hardening futuro).

## Dependencias
- `T-1502`: tablas SQLite con columnas de estado disponibles.
- `T-1506`: `finops_form_drafts` implementado.
- `T-1510`: `FinOpsSyncQueuePanel` disponible para apertura automática.
- `T-0916`: boot del desktop autenticado — la lógica de recovery de FinOps se ejecuta después del boot de auth.

## Criterios de aceptación
- [ ] Al reiniciar con ítems `SYNCING` en cola → su estado se resetea a `PENDING`.
- [ ] Notificación de recovery visible si hay ítems recuperados.
- [ ] Panel de sync se abre automáticamente si `count > 0`.
- [ ] Borradores de formulario disponibles tras reinicio.
- [ ] `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Prueba manual: crear 2 ítems offline → cerrar app abruptamente → reabrir → notificación "2 operaciones pendientes" + panel abierto.

## Pruebas
- Ítem en estado `SYNCING` al cerrar → reiniciar → estado reseteado a `PENDING`.
- 0 ítems en cola al reiniciar → sin notificación, panel no se abre.
- Borrador de movimiento al reiniciar → banner visible al navegar a "Nuevo movimiento".

## Riesgos
- **Ítems duplicados si la app se cierra en medio de un reintento exitoso**: el backend puede haber procesado el ítem pero la actualización del caché local no completó. El idempotency key (T-1507) previene duplicados en el backend, pero el caché local puede quedar con dos registros. Mitigación: al resetear `SYNCING → PENDING`, verificar si el UUID ya existe en el caché como `SYNCED`.

## Documentación a actualizar
- `apps/desktop/src-tauri/src/finops/boot.rs` — archivo nuevo.
- `apps/desktop/src/modules/finops/hooks/useFinOpsBootRecovery.ts` — archivo nuevo.

## Decisiones clave
- **Recovery en boot, no lazy**: la recuperación de ítems se ejecuta al iniciar la app, no cuando el usuario navega al módulo FinOps. Esto garantiza que el Sync Core tiene la cola completa desde el primer momento y puede comenzar a procesar al conectarse.
- **Apertura automática del panel solo si hay ítems recuperados**: no abrir el panel en cada inicio — solo cuando hay algo que el usuario necesita saber. Abrir el panel innecesariamente sería molesto.

## Evidencia documental
- `apps/desktop/src-tauri/src/finops/boot.rs`
- `apps/desktop/src/modules/finops/hooks/useFinOpsBootRecovery.ts`

## Pendientes para la siguiente task
- `T-1512` integra el Sync Center del módulo FinOps en el layout desktop.

## Pendientes no resueltos
- Ninguno.
