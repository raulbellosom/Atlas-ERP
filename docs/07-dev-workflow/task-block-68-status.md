# Task Block 68 Status — Fase 8 Bloque 6

## Identificacion
- Bloque: `Bloque 6`
- Fase: `Fase 8`
- Tasks: `T-0825` a `T-0829`
- Estado: `CERRADO`
- Fecha de cierre: `2026-04-13`

## Tasks del bloque

| Task | Titulo | Estado |
|------|--------|--------|
| T-0825 | Configurar modo offline visual base | CERRADA |
| T-0826 | Configurar indicador de conexion | CERRADA |
| T-0827 | Configurar detector de estado de sync pendiente | CERRADA |
| T-0828 | Configurar shell del Sync Center | CERRADA |
| T-0829 | Configurar navegacion principal por modulos | CERRADA |

## Entregables

- `src/hooks/useOnlineStatus.js` — detecta conexion via eventos online/offline
- `src/components/ui/OfflineBanner.jsx` — banner amarillo en PrivateLayout cuando offline
- `src/components/layout/ConnectionIndicator.jsx` — punto verde/amarillo en TopBar
- `src/store/sync.store.js` — Zustand store persistido: pendingCount, lastSyncAt
- `src/hooks/useSyncStatus.js` — hook combinado: isOnline + sync state
- `src/pages/sync/SyncCenterPage.jsx` — shell de la pagina `/sync`
- `src/components/layout/Sidebar.jsx` — refactorizado con NAV_GROUPS y badge de pendientes

## Validaciones
- lint: OK
- build: OK
