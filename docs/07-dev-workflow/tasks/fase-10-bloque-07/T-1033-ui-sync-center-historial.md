# T-1033 - Implementar UI del Sync Center: historial

## Metadatos
- ID: `T-1033`
- Fase: `Fase 10`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
`SyncCenterTabs.jsx` — tab "Historial":

- Componente `HistorySection`: carga todos los items sin filtro de status (`listSyncItems({ limit: 200 })`)
- Columnas: Entidad, ID entidad, Operacion, Estado (StatusBadge), Aprobacion (badge coloreado), Intentos, Creado, boton Detalle
- Boton "Detalle" por fila abre `ConflictDetailPanel` con el item seleccionado
- Click en la fila tambien abre el detalle
- Muestra hasta 200 items mas recientes

## Criterios de aceptacion
- [x] Muestra todos los items locales sin filtro de status.
- [x] Badges de status y aprobacion coloreados correctamente.
- [x] Click en fila o boton "Detalle" abre ConflictDetailPanel (T-1034).
- [x] Build OK.
