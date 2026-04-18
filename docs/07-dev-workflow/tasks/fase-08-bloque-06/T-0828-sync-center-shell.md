# T-0828 - Configurar shell del Sync Center

## Metadatos
- ID: `T-0828`
- Fase: `Fase 8`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/pages/sync/SyncCenterPage.jsx`:
  - Seccion de estado de conexion (dot + texto).
  - Seccion de cambios pendientes con contador y boton "Marcar como sincronizadas".
  - Fecha de ultima sincronizacion formateada con `formatDateTime`.
- Ruta `/sync` en `App.jsx` (lazy loaded dentro de rutas privadas).

## Criterios de aceptacion
- [x] Pagina accesible en `/sync`.
- [x] Refleja estado real de `useSyncStatus`.
- [x] lint + build OK.
