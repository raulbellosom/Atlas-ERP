# Blueprint Técnico: Sync Center

## Identificación
- Módulo frontend: `apps/web/src/modules/sync/` y `apps/desktop` (UI del Sync Center)
- Módulo backend: `apps/api/src/modules/sync/`
- Módulo worker: procesadores de sync en `apps/worker`

## Propósito
El Sync Center es la interfaz donde el usuario puede revisar, aprobar, rechazar o fusionar los conflictos de sincronización entre datos locales y datos del servidor.

## Flujo de sincronización

```
Cliente offline → genera operaciones → sync_queue local
                                            ↓
                              Usuario conecta → cliente envía cola
                                            ↓
                              Servidor valida cada operación
                                      ↙         ↘
                             Sin conflicto    Con conflicto
                                  ↓                ↓
                            Aplica cambio    Crea registro en
                            en PostgreSQL    sync_conflicts
                                  ↓                ↓
                            Responde OK      Notifica al usuario
                                             para revisión manual
```

## Entidades de sync en el backend

### `SyncSession`
Sesión de sincronización iniciada por un cliente.
- `id`, `client_id`, `started_at`, `completed_at`, `status`, `items_total`, `items_synced`, `items_conflicted`

### `SyncItem`
Ítem individual de la cola procesado durante una sesión.
- `id`, `session_id`, `operation`, `entity`, `entity_id`, `payload`, `status`, `processed_at`

### `SyncConflict`
Conflicto detectado que requiere resolución manual.
- `id`, `sync_item_id`, `entity`, `entity_id`, `local_payload`, `server_payload`, `status`, `resolution`, `resolved_by`, `resolved_at`

## Pantallas del Sync Center

1. **Dashboard de sync**: estado global (todo sincronizado / hay conflictos / sincronizando)
2. **Lista de conflictos**: pendientes de resolución con filtros por módulo y fecha
3. **Detalle de conflicto**: comparación lado a lado de versión local vs servidor con opciones:
   - Aprobar versión local
   - Conservar versión servidor
   - Descartar local
   - Fusionar manualmente (editor de campos)
4. **Historial de sync**: sesiones pasadas con resultado

## Política de resolución
- Ningún conflicto se resuelve automáticamente en datos financieros o de negocio.
- El usuario con permiso `sync:resolve` puede resolver conflictos.
- Cada resolución se audita con usuario, timestamp y resolución elegida.
