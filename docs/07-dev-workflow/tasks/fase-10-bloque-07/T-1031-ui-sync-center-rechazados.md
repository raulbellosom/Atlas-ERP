# T-1031 - Implementar UI del Sync Center: rechazados

## Metadatos
- ID: `T-1031`
- Fase: `Fase 10`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
`SyncCenterTabs.jsx` — tab "Rechazados":

- Componente `RejectedSection`: carga todos los items (limit 200) y filtra client-side
- Filtro: `approvalStatus === 'rejected' || status === 'canceled'`
- Columnas: Entidad, ID entidad, Operacion, Motivo de rechazo (approvalReason), Creado
- Tabla read-only, sin acciones

## Criterios de aceptacion
- [x] Muestra items rechazados por aprobacion local y cancelados.
- [x] Columna de motivo de rechazo truncada a 14rem.
- [x] Build OK.
