# SQLite Local Integration Skill

## ID de task origen

- `T-0131`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la integración de SQLite local en el cliente desktop de AtlasERP para caché, cola de sync y datos offline.

## Procedimiento

### 1. Propósitos de SQLite local

- **Cola de sync**: operaciones encoladas mientras se trabaja offline.
- **Caché de datos**: datos frecuentes descargados para consulta rápida.
- **Snapshots**: copias puntuales de datos para trabajo offline temporal.
- **Sesión local**: tokens y estado de sesión persistente.
- **Adjuntos pendientes**: referencias a archivos por subir al servidor.

### 2. Estructura de tablas locales

```sql
-- Cola de sincronización
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  operation TEXT NOT NULL,  -- CREATE, UPDATE, DELETE
  payload TEXT NOT NULL,    -- JSON serializado
  status TEXT DEFAULT 'PENDING',  -- PENDING, SENDING, SENT, FAILED, CONFLICT
  retry_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Caché de datos
CREATE TABLE local_cache (
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  data TEXT NOT NULL,       -- JSON serializado
  server_version INTEGER,
  cached_at TEXT NOT NULL,
  PRIMARY KEY (entity_type, entity_id)
);

-- Sesión local
CREATE TABLE local_session (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Adjuntos pendientes
CREATE TABLE pending_attachments (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TEXT NOT NULL
);
```

### 3. Migraciones locales

- Versionado de schema local con tabla de versiones.
- Migraciones aplicadas al iniciar la app.
- Compatible con actualizaciones de la app.

### 4. Repositorios locales

- Capa de abstracción sobre SQLite (no SQL directo en componentes).
- Funciones de: enqueue, dequeue, getByStatus, retryFailed, purgeCompleted.
- Funciones de caché: get, set, invalidate, purgeOld.

### 5. Persistencia

- La cola debe sobrevivir reinicios de la app.
- La caché puede purgarse sin pérdida crítica.
- La sesión local debe recuperarse al reiniciar.

### 6. Restricciones

- SQLite no sustituye PostgreSQL central.
- No almacenar datos que excedan lo necesario para offline parcial.
- Limpiar datos obsoletos periódicamente.
- No almacenar secretos en SQLite sin cifrado.

## Referencia

- `docs/05-sync/00-politica-soporte-offline.md`
- `docs/03-domain-blueprints/sync-core.md`
