# T-1030 - Implementar UI del Sync Center: sincronizados

## Metadatos
- ID: `T-1030`
- Fase: `Fase 10`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
`SyncCenterTabs.jsx` — tab "Sincronizados":

- Componente `SyncedSection`: carga items con `listSyncItems({ status: 'done', limit: 100 })`
- Tabla read-only con columnas: Entidad, ID entidad, Operacion, Intentos, Creado, Sincronizado (updatedAt)
- Boton de recarga manual
- Contador de items en header

## Criterios de aceptacion
- [x] Muestra exclusivamente items con status='done'.
- [x] Tabla read-only sin acciones de aprobacion/rechazo.
- [x] Build OK.
