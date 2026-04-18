# Blueprint Técnico: SQLite Local (Desktop)

## Identificación
- Contexto: `apps/desktop/src-tauri/`
- Tecnología: SQLite via `rusqlite` o `sqlx` en Rust
- Propósito: caché local, cola de sync y snapshots controlados

## Principio fundamental
SQLite local es auxiliar. El servidor (PostgreSQL) es la fuente de verdad. Ningún dato en SQLite local es definitivo hasta que el servidor lo confirme.

## Tablas mínimas del esquema local

### `sync_queue`
Cola de operaciones pendientes de enviar al servidor.

```sql
CREATE TABLE sync_queue (
  id          TEXT PRIMARY KEY,
  operation   TEXT NOT NULL,  -- 'create' | 'update' | 'delete'
  entity      TEXT NOT NULL,  -- nombre del modelo, ej. 'BankAccount'
  entity_id   TEXT NOT NULL,
  payload     TEXT NOT NULL,  -- JSON con los datos del cambio
  status      TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed'
  created_at  TEXT NOT NULL,
  synced_at   TEXT
);
```

### `sync_conflicts`
Registro de conflictos detectados pendientes de resolución.

```sql
CREATE TABLE sync_conflicts (
  id              TEXT PRIMARY KEY,
  sync_queue_id   TEXT NOT NULL,
  entity          TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  local_payload   TEXT NOT NULL,
  server_payload  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'resolved'
  resolution      TEXT,  -- 'local' | 'server' | 'manual'
  created_at      TEXT NOT NULL,
  resolved_at     TEXT
);
```

### `cache_snapshots`
Caché de datos del servidor para uso offline.

```sql
CREATE TABLE cache_snapshots (
  entity      TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  payload     TEXT NOT NULL,  -- JSON con los datos cacheados
  synced_at   TEXT NOT NULL,
  PRIMARY KEY (entity, entity_id)
);
```

### `local_preferences`
Preferencias del usuario almacenadas localmente.

```sql
CREATE TABLE local_preferences (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

## Política de limpieza
- Los registros de `sync_queue` con estado `synced` se eliminan después de 7 días.
- Los snapshots de entidades eliminadas en servidor se limpian en la próxima sincronización.
- Los conflictos resueltos se archivan (no se eliminan) para auditoría local.

## Seguridad
- El archivo SQLite se almacena en el `appDataDir` de Tauri, que es privado al usuario del sistema operativo.
- En versiones futuras, considerar cifrado del archivo SQLite (SQLCipher) para datos sensibles.
