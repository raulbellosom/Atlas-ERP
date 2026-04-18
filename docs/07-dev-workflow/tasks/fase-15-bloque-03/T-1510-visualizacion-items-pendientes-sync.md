# T-1510 - Crear visualización de items pendientes por sincronizar

## Metadatos
- ID: `T-1510`
- Fase: `Fase 15`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la vista de ítems pendientes de sincronización específica del módulo FinOps dentro del Sync Center desktop, mostrando al usuario cuántas operaciones están en cola, su tipo y estado, con acciones de reintento y descarte.

## Alcance
- Crear componente `FinOpsSyncQueuePanel` en `apps/desktop/src/modules/finops/components/`:
  - Lista de ítems en `finops_sync_queue` con columnas: tipo de entidad, operación, fecha de creación, estado (PENDING / ERROR / SYNCING), intentos.
  - Badge/contador en el header del módulo FinOps que muestra el total de ítems pendientes.
  - Acciones por ítem:
    - "Reintentar ahora" — fuerza el procesamiento del ítem sin esperar al ciclo automático.
    - "Descartar" — elimina el ítem de la cola (con confirmación). El registro del caché local se marca como `DISCARDED`.
  - Filtro por estado (PENDING / ERROR / SYNCING).
- Hook `useFinOpsSyncQueue()`:
  - Lee `finops_sync_queue` desde SQLite via comando Tauri.
  - Se actualiza en tiempo real mediante event listener de Tauri.
- Integrar `FinOpsSyncQueuePanel` en el layout desktop de FinOps como panel lateral colapsable.

## Fuera de alcance
- Sync Center global del desktop (T-1512 lo integra al layout general).
- Resolución de conflictos de merge (Fase 17+).
- Historial de sincronizaciones completadas (Fase 17+).

## Dependencias
- `T-1507` a `T-1509`: cola de sync poblada con ítems de las operaciones offline.
- `T-1025` a `T-1029`: Sync Center base del desktop implementado — `FinOpsSyncQueuePanel` se integra en él.
- `T-0914`: eventos del Sync Core desktop disponibles para actualización en tiempo real.

## Criterios de aceptación
- [ ] `FinOpsSyncQueuePanel` renderiza ítems de la cola con estado correcto.
- [ ] Badge en header muestra conteo de pendientes (actualizado en tiempo real).
- [ ] Reintento forzado funcional.
- [ ] Descarte con confirmación funcional.
- [ ] `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: crear 3 ítems offline → panel muestra 3 ítems con estado PENDING → reconectar → ítems pasan a SYNCING → desaparecen al completarse.

## Pruebas
- Cola con 3 ítems → badge muestra "3" → sync → badge desaparece.
- Ítem con ERROR → botón "Reintentar" disponible → click → estado cambia a SYNCING.
- Descartar ítem → confirmación → ítem eliminado de cola → badge actualizado.

## Riesgos
- **Actualización en tiempo real del panel**: los eventos del Sync Core se emiten desde el proceso Rust (backend de Tauri). Si el listener en React no está activo, el panel puede mostrar datos obsoletos. Mitigación: usar `listen` de `@tauri-apps/api/event` con cleanup en `useEffect`.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/components/FinOpsSyncQueuePanel.tsx` — archivo nuevo.
- `apps/desktop/src/modules/finops/hooks/useFinOpsSyncQueue.ts` — archivo nuevo.

## Decisiones clave
- **Panel lateral colapsable, no pantalla separada**: el panel de sync queue se integra como sidebar colapsable del layout FinOps. El usuario puede trabajar y ver el estado de sync simultáneamente sin cambiar de pantalla.
- **Reintento visible y manual**: el sistema hace reintentos automáticos (Sync Core de T-0914), pero el usuario puede forzar un reintento inmediato. Esto da sensación de control y reduce la ansiedad de "¿se sincronizó o no?".

## Evidencia documental
- `apps/desktop/src/modules/finops/components/FinOpsSyncQueuePanel.tsx`
- `apps/desktop/src/modules/finops/hooks/useFinOpsSyncQueue.ts`

## Pendientes para la siguiente task
- `T-1511` implementa la recuperación de estado de la cola tras reinicio de la app.

## Pendientes no resueltos
- Ninguno.
