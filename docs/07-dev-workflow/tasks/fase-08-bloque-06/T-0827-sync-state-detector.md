# T-0827 - Configurar detector de estado de sync pendiente

## Metadatos
- ID: `T-0827`
- Fase: `Fase 8`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/store/sync.store.js`: Zustand store persistido en `atlas-sync`.
  - Estado: `pendingCount`, `lastSyncAt`.
  - Acciones: `addPending(n?)`, `removePending(n?)`, `clearPending()`.
- `src/hooks/useSyncStatus.js`: hook combinado que expone `isOnline`, `pendingCount`, `hasPending`, `lastSyncAt` y las acciones del store.

## Criterios de aceptacion
- [x] Store persiste en localStorage entre recargas.
- [x] Hook disponible para cualquier componente.
- [x] lint + build OK.
