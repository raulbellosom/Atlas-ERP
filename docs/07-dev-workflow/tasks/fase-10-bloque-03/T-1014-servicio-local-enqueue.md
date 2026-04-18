# T-1014 - Implementar servicio local de enqueue

## Metadatos
- ID: `T-1014`
- Fase: `Fase 10`
- Bloque: `Bloque 3`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Implementar servicio de enqueue local que aplique reglas offline, idempotencia, detección de duplicados y estrategia de aprobación.

## Implementación
- Servicio agregado en `apps/desktop/src/modules/sync/localSyncEnqueueService.js`.
- Flujo implementado:
  - valida reglas offline por entidad/operación,
  - construye `idempotencyKey` y `fingerprint`,
  - evita duplicados por idempotency,
  - encola item en SQLite contractual,
  - aplica aprobación automática o revisión pendiente según riesgo.
- Integración inicial en bootstrap/UI:
  - `useDesktopBootstrap` expone `enqueueSyncItemDraft` y cuenta `syncItemsPendingCount`.
  - `App.jsx` agrega acción de enqueue demo.
  - `LocalSyncStatusPanel` muestra métricas de `sync items v2`.

## Criterios de aceptación
- [x] Servicio de enqueue local implementado con validaciones previas.
- [x] Integración mínima con capa UI para smoke operativo.
- [x] Trazabilidad de estado y conteo de items pendientes disponible.

## Evidencia
- `apps/desktop/src/modules/sync/localSyncEnqueueService.js`
- `apps/desktop/src/hooks/useDesktopBootstrap.js`
- `apps/desktop/src/App.jsx`
- `apps/desktop/src/components/sync/LocalSyncStatusPanel.jsx`
