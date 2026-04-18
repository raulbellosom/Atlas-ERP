# T-1029 - Implementar UI del Sync Center: pendientes

## Metadatos
- ID: `T-1029`
- Fase: `Fase 10`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
`apps/desktop/src/components/sync/SyncCenterPendingTable.jsx` — tabla de items de sincronizacion local:

- Columnas: Entidad, ID entidad, Operacion, Estado (StatusBadge), Aprobacion (ApprovalBadge), Intentos, Creado, Acciones
- Usa `listSyncItems({ status, limit: 100 })` de `localSyncItemsRepository.js`
- Acciones: Aprobar / Rechazar visibles solo para items en approvalStatus='pending_review'
- Boton de recarga manual (llama `load()`)
- Estado vacio con mensaje cuando no hay items
- Estado de carga en celda colspan=8
- Prop opcional `statusFilter` para pre-filtrar por status

### Montado en `App.jsx`
- `<SyncCenterPendingTable />` insertado entre LocalSyncStatusPanel y logs locales

## Criterios de aceptacion
- [x] Tabla muestra items con badges de status y aprobacion.
- [x] Acciones Aprobar/Rechazar solo visibles para pending_review.
- [x] Recarga manual funciona.
- [x] Build Vite OK (52 modulos, sin errores).
