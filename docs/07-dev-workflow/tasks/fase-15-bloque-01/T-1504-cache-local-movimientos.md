# T-1504 - Crear caché local de movimientos

## Metadatos
- ID: `T-1504`
- Fase: `Fase 15`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el caché local de movimientos financieros en la aplicación desktop Tauri, con una ventana configurable de los últimos 90 días, y soportar la adición de nuevos movimientos creados en modo offline directamente al caché local antes de sincronizar.

## Alcance
- Crear hook `useFinancialMovementsDesktop()` en `apps/desktop/src/modules/finops/hooks/`:
  - Online: llama a `GET /api/v1/financial-movements` con filtro `from=today-90d`, guarda en `finops_movements_cache`.
  - Offline: lee desde `finopsCache.getMovements({ organizationId, from })`.
  - Expone `{ data, isOffline, lastSyncedAt, refetch }`.
- Lógica de append local para movimientos offline:
  - Cuando el usuario crea un movimiento offline (T-1507), se inserta en `finops_movements_cache` con `status: 'PENDING_SYNC'` además de encolar en `finops_sync_queue`.
  - Los movimientos `PENDING_SYNC` se muestran con un badge visual diferenciador ("Pendiente de sync").
  - Al sincronizar exitosamente, el registro local se actualiza con el `id` real del backend y se elimina el badge.
- Ventana de caché: 90 días por defecto, configurable vía `FINOPS_MOVEMENTS_CACHE_DAYS`.
- Integrar en `FinancialMovementsPage` desktop.

## Fuera de alcance
- Filtros avanzados en el caché local (solo filtro básico por fecha y cuenta en v1 offline).
- Attachments de movimientos offline (T-1513).
- Enqueue de creación de movimientos (T-1507 lo implementa, esta task solo define cómo se refleja en la caché).

## Dependencias
- `T-1502`: tabla `finops_movements_cache` disponible.
- `T-1503`: patrón de hook desktop establecido — se replica para movimientos.
- `T-1405`: `FinancialMovementsPage` web como base de la versión desktop.

## Criterios de aceptación
- [x] Hook `useFinancialMovementsDesktop` implementado con lógica online/offline en `apps/desktop/src/modules/finops/hooks/useFinancialMovementsDesktop.js`.
- [x] Movimientos `PENDING_SYNC` visibles con badge amarillo diferenciador.
- [x] `appendOfflineMovement()` disponible para que T-1507 inserte movimientos offline en caché.
- [x] `FinancialMovementsPage` desktop creada en `apps/desktop/src/pages/finops/FinancialMovementsPage.jsx`.
- [x] `pnpm --filter @atlasrep/desktop run lint`: 0 errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: crear movimiento offline → aparece en lista con badge "Pendiente" → reconectar → badge desaparece.

## Pruebas
- Online → sincronizar caché → desconectar → lista de movimientos visible.
- Crear movimiento offline → aparece inmediatamente en la lista con badge "Pendiente de sync".
- Reconectar → movimiento se sincroniza → badge desaparece, `id` se actualiza al del backend.
- Caché de 90 días: movimiento de hace 91 días no aparece en la lista offline.

## Riesgos
- **Actualización del id local al id del backend tras sync**: el movimiento creado offline tiene un UUID local temporal. Al sincronizar, el backend devuelve el UUID real. Si el usuario tiene el detalle del movimiento abierto, el id en la URL cambia. Mitigación: usar el UUID local como clave hasta que el sync confirme y luego actualizar la URL sin recargar.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/hooks/useFinancialMovementsDesktop.ts` — archivo nuevo.
- `apps/desktop/src/pages/finops/FinancialMovementsPage.tsx` — adaptación desktop.

## Decisiones clave
- **UUID local temporal para movimientos offline**: los movimientos creados offline reciben un UUID v4 generado localmente que sirve como clave hasta que el backend confirma el sync y devuelve el UUID real. Esto permite mostrar el movimiento en la UI de inmediato sin esperar al servidor.
- **Badge visual en lugar de separación en lista**: los movimientos pendientes de sync se muestran en la misma lista que los sincronizados, solo con un badge diferenciador. Separarlos en secciones distintas complicaría la UX y la paginación.

## Evidencia documental
- `apps/desktop/src/modules/finops/hooks/useFinancialMovementsDesktop.ts`
- `apps/desktop/src/pages/finops/FinancialMovementsPage.tsx`

## Pendientes para la siguiente task
- `T-1505` implementa el caché de saldos y resúmenes financieros.

## Pendientes no resueltos
- Ninguno.
