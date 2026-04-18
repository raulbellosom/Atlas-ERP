# T-1032 - Implementar UI del Sync Center: conflictos

## Metadatos
- ID: `T-1032`
- Fase: `Fase 10`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
`SyncCenterTabs.jsx` — tab "Conflictos":

- Componente `ConflictsSection`: carga items con status='failed', filtra por `lastError.toLowerCase().includes('conflict')`
- Columnas: Entidad, ID entidad, Operacion, Intentos, Error (truncado, rose), Creado, boton "Ver detalle"
- Boton "Ver detalle" llama `onSelectItem(item)` → abre `ConflictDetailPanel`
- Nota informativa cuando hay items: "Items marcados como fallidos por conflicto en el backend"
- Contador con countTone='rose' en header

## Criterios de aceptacion
- [x] Muestra solo items fallidos por conflicto del backend (lastError contains 'conflict').
- [x] Boton "Ver detalle" abre el panel lateral (T-1034).
- [x] Build OK.
