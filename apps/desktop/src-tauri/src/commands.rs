use std::collections::HashMap;
use std::fs;
use std::io::Write;
use std::net::{TcpStream, ToSocketAddrs};
use std::path::{Component, PathBuf};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;
use rand::RngCore;
use rusqlite::types::ValueRef;
use rusqlite::{params, params_from_iter, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Manager};

#[derive(Debug, Default, Serialize, Deserialize)]
struct SecureStore {
    values: HashMap<String, String>,
}

#[derive(Debug, Serialize)]
pub struct PrintRequestResult {
    accepted: bool,
    detail: String,
}

#[derive(Debug, Serialize)]
pub struct NetworkStatus {
    online: bool,
    checked_at: u64,
    mode: String,
}

#[derive(Debug, Serialize)]
pub struct DesktopPaths {
    app_data_dir: String,
    db_file: String,
    secure_store_file: String,
    files_dir: String,
    exports_dir: String,
    queue_dir: String,
    cache_dir: String,
    logs_dir: String,
    attachments_dir: String,
    tmp_dir: String,
}

#[derive(Debug, Serialize)]
pub struct UpdaterStatus {
    channel: String,
    current_version: String,
    auto_update_enabled: bool,
    supports_background: bool,
    provider: String,
}

#[derive(Debug, Serialize)]
pub struct UpdaterCheckResult {
    checked_at: u64,
    update_available: bool,
    latest_version: Option<String>,
    notes: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncQueueItem {
    id: i64,
    entity: String,
    operation: String,
    payload_json: String,
    status: String,
    attempts: i64,
    priority: i64,
    last_error: Option<String>,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncQueueStorageItem {
    id: i64,
    item_id: String,
    entity: String,
    entity_id: String,
    operation: String,
    payload_json: String,
    source: String,
    occurred_at: String,
    idempotency_key: String,
    fingerprint: String,
    approval_status: String,
    approval_reason: Option<String>,
    status: String,
    attempts: i64,
    priority: i64,
    retry_at: Option<String>,
    last_error: Option<String>,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize)]
pub struct SyncQueueSummary {
    pending: i64,
    processing: i64,
    failed: i64,
    done: i64,
    total: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DesktopLogEntry {
    id: i64,
    level: String,
    module: String,
    message: String,
    context_json: Option<String>,
    created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncConflictItem {
    id: i64,
    entity: String,
    entity_id: String,
    local_payload_json: String,
    remote_payload_json: String,
    reason: String,
    source: String,
    status: String,
    resolution: Option<String>,
    merged_payload_json: Option<String>,
    created_at: String,
    updated_at: String,
}

struct LocalMigration {
    id: &'static str,
    description: &'static str,
    sql: &'static str,
}

const LOCAL_MIGRATIONS: &[LocalMigration] = &[
    LocalMigration {
        id: "001_base_meta_tables",
        description: "Tablas base de metadata y tracking de migraciones.",
        sql: r#"
            CREATE TABLE IF NOT EXISTS __atlaserp_meta (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS __atlaserp_migrations (
              id TEXT PRIMARY KEY,
              description TEXT NOT NULL,
              applied_at TEXT NOT NULL
            );
        "#,
    },
    LocalMigration {
        id: "002_sync_queue_table",
        description: "Cola local de sincronizacion offline-first.",
        sql: r#"
            CREATE TABLE IF NOT EXISTS sync_queue (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              entity TEXT NOT NULL,
              operation TEXT NOT NULL,
              payload_json TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              attempts INTEGER NOT NULL DEFAULT 0,
              priority INTEGER NOT NULL DEFAULT 100,
              last_error TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_sync_queue_status_priority_id
              ON sync_queue(status, priority, id);
        "#,
    },
    LocalMigration {
        id: "003_logs_and_conflicts_tables",
        description: "Bitacora local desktop y conflictos descargados de sync.",
        sql: r#"
            CREATE TABLE IF NOT EXISTS desktop_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              level TEXT NOT NULL,
              module TEXT NOT NULL,
              message TEXT NOT NULL,
              context_json TEXT,
              created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_desktop_logs_level_id
              ON desktop_logs(level, id);

            CREATE TABLE IF NOT EXISTS sync_conflicts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              entity TEXT NOT NULL,
              entity_id TEXT NOT NULL,
              local_payload_json TEXT NOT NULL,
              remote_payload_json TEXT NOT NULL,
              reason TEXT NOT NULL,
              source TEXT NOT NULL DEFAULT 'download',
              status TEXT NOT NULL DEFAULT 'pending',
              resolution TEXT,
              merged_payload_json TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status_id
              ON sync_conflicts(status, id);
        "#,
    },
    LocalMigration {
        id: "004_sync_queue_items_table",
        description: "Storage contractual de items de sync (idempotencia, aprobacion y reglas offline).",
        sql: r#"
            CREATE TABLE IF NOT EXISTS sync_queue_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              item_id TEXT NOT NULL UNIQUE,
              entity TEXT NOT NULL,
              entity_id TEXT NOT NULL,
              operation TEXT NOT NULL,
              payload_json TEXT NOT NULL,
              source TEXT NOT NULL DEFAULT 'desktop',
              occurred_at TEXT NOT NULL,
              idempotency_key TEXT NOT NULL,
              fingerprint TEXT NOT NULL,
              approval_status TEXT NOT NULL DEFAULT 'pending_review',
              approval_reason TEXT,
              status TEXT NOT NULL DEFAULT 'pending',
              attempts INTEGER NOT NULL DEFAULT 0,
              priority INTEGER NOT NULL DEFAULT 100,
              retry_at TEXT,
              last_error TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_sync_queue_items_status_priority_occurred
              ON sync_queue_items(status, priority, occurred_at, id);
            CREATE INDEX IF NOT EXISTS idx_sync_queue_items_idempotency
              ON sync_queue_items(idempotency_key);
            CREATE INDEX IF NOT EXISTS idx_sync_queue_items_entity_entity_id
              ON sync_queue_items(entity, entity_id, occurred_at);
        "#,
    },
    LocalMigration {
        id: "005_finops_cache_tables",
        description: "Tablas de cache local del modulo FinOps (cuentas, movimientos, transferencias, CxC, CxP, saldo).",
        sql: r#"
            CREATE TABLE IF NOT EXISTS finops_bank_accounts_cache (
              id TEXT PRIMARY KEY,
              organization_id TEXT NOT NULL,
              name TEXT NOT NULL,
              account_number TEXT,
              balance REAL NOT NULL DEFAULT 0,
              currency TEXT NOT NULL DEFAULT 'MXN',
              type TEXT,
              is_active INTEGER NOT NULL DEFAULT 1,
              synced_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_finops_bank_accounts_org
              ON finops_bank_accounts_cache(organization_id);

            CREATE TABLE IF NOT EXISTS finops_movements_cache (
              id TEXT PRIMARY KEY,
              bank_account_id TEXT NOT NULL,
              amount REAL NOT NULL,
              currency TEXT NOT NULL DEFAULT 'MXN',
              type TEXT,
              status TEXT,
              movement_date TEXT,
              description TEXT,
              synced_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_finops_movements_account_date
              ON finops_movements_cache(bank_account_id, movement_date);

            CREATE TABLE IF NOT EXISTS finops_transfers_cache (
              id TEXT PRIMARY KEY,
              from_account_id TEXT NOT NULL,
              to_account_id TEXT NOT NULL,
              amount REAL NOT NULL,
              currency TEXT NOT NULL DEFAULT 'MXN',
              status TEXT,
              transfer_date TEXT,
              synced_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_finops_transfers_date
              ON finops_transfers_cache(transfer_date);

            CREATE TABLE IF NOT EXISTS finops_cxc_cache (
              id TEXT PRIMARY KEY,
              organization_id TEXT NOT NULL,
              counterparty TEXT,
              amount REAL NOT NULL,
              currency TEXT NOT NULL DEFAULT 'MXN',
              due_date TEXT,
              status TEXT,
              synced_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_finops_cxc_org_status
              ON finops_cxc_cache(organization_id, status);

            CREATE TABLE IF NOT EXISTS finops_cxp_cache (
              id TEXT PRIMARY KEY,
              organization_id TEXT NOT NULL,
              counterparty TEXT,
              amount REAL NOT NULL,
              currency TEXT NOT NULL DEFAULT 'MXN',
              due_date TEXT,
              status TEXT,
              synced_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_finops_cxp_org_status
              ON finops_cxp_cache(organization_id, status);

            CREATE TABLE IF NOT EXISTS finops_balance_summary_cache (
              organization_id TEXT NOT NULL,
              currency TEXT NOT NULL DEFAULT 'MXN',
              total REAL NOT NULL DEFAULT 0,
              active_accounts INTEGER NOT NULL DEFAULT 0,
              cached_at TEXT NOT NULL,
              PRIMARY KEY (organization_id, currency)
            );
        "#,
    },
    LocalMigration {
        id: "006_finops_form_drafts",
        description: "Borradores locales de formularios FinOps (movimientos, transferencias, CxC, CxP).",
        sql: r#"
            CREATE TABLE IF NOT EXISTS finops_form_drafts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              form_type TEXT NOT NULL UNIQUE,
              payload TEXT NOT NULL DEFAULT '{}',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );
        "#,
    },
    LocalMigration {
        id: "007_finops_attachment_queue",
        description: "Cola de adjuntos pendientes de upload a MinIO para operaciones FinOps offline.",
        sql: r#"
            CREATE TABLE IF NOT EXISTS finops_attachment_queue (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              local_movement_id TEXT NOT NULL,
              backend_movement_id TEXT,
              local_path TEXT NOT NULL,
              original_filename TEXT NOT NULL,
              mime_type TEXT,
              size_bytes INTEGER NOT NULL DEFAULT 0,
              status TEXT NOT NULL DEFAULT 'pending',
              last_error TEXT,
              attempts INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_finops_attachment_queue_movement
              ON finops_attachment_queue(local_movement_id, status);
        "#,
    },
];

fn now_unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map_err(|error| {
        format!(
            "No fue posible resolver el directorio de datos local de AtlasERP Desktop: {error}"
        )
    })
}

fn db_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("db").join("atlaserp-desktop.db"))
}

fn secure_store_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?
        .join("secure")
        .join("secure-storage-v1.json"))
}

fn files_root_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("files"))
}

fn exports_root_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("exports"))
}

fn queue_root_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("queue"))
}

fn cache_root_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("cache"))
}

fn logs_root_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("logs"))
}

fn attachments_root_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("attachments"))
}

fn tmp_root_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("tmp"))
}

fn build_desktop_paths(app: &AppHandle) -> Result<DesktopPaths, String> {
    let app_data = app_data_dir(app)?;
    Ok(DesktopPaths {
        app_data_dir: app_data.to_string_lossy().to_string(),
        db_file: db_file_path(app)?.to_string_lossy().to_string(),
        secure_store_file: secure_store_file_path(app)?.to_string_lossy().to_string(),
        files_dir: files_root_path(app)?.to_string_lossy().to_string(),
        exports_dir: exports_root_path(app)?.to_string_lossy().to_string(),
        queue_dir: queue_root_path(app)?.to_string_lossy().to_string(),
        cache_dir: cache_root_path(app)?.to_string_lossy().to_string(),
        logs_dir: logs_root_path(app)?.to_string_lossy().to_string(),
        attachments_dir: attachments_root_path(app)?.to_string_lossy().to_string(),
        tmp_dir: tmp_root_path(app)?.to_string_lossy().to_string(),
    })
}

fn ensure_parent_dir_exists(path: &PathBuf) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("No fue posible crear directorios padres: {error}"))?;
    }
    Ok(())
}

fn validate_relative_path(relative_path: &str) -> Result<PathBuf, String> {
    let trimmed = relative_path.trim();
    if trimmed.is_empty() {
        return Err("La ruta relativa no puede estar vacia.".to_string());
    }

    let candidate = PathBuf::from(trimmed);
    for component in candidate.components() {
        match component {
            Component::Normal(_) => {}
            _ => {
                return Err(
                    "La ruta contiene componentes no permitidos (solo rutas relativas seguras)."
                        .to_string(),
                )
            }
        }
    }

    Ok(candidate)
}

fn secure_store_compound_key(namespace: &str, key: &str) -> String {
    format!("{namespace}::{key}")
}

fn derive_encryption_key(app: &AppHandle) -> [u8; 32] {
    let identifier = app.config().identifier.clone();
    let user = std::env::var("USERNAME")
        .or_else(|_| std::env::var("USER"))
        .unwrap_or_else(|_| "atlaserp-user".to_string());

    let seed = format!("{identifier}::{user}::atlaserp-desktop-secure-storage-v1");
    let digest = Sha256::digest(seed.as_bytes());
    let mut key = [0u8; 32];
    key.copy_from_slice(&digest[..32]);
    key
}

fn encrypt_value(app: &AppHandle, raw: &str) -> Result<String, String> {
    let key = derive_encryption_key(app);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|error| format!("No fue posible inicializar cifrado AES-GCM: {error}"))?;

    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let encrypted = cipher
        .encrypt(nonce, raw.as_bytes())
        .map_err(|error| format!("No fue posible cifrar dato seguro: {error}"))?;

    let mut payload = nonce_bytes.to_vec();
    payload.extend(encrypted);

    Ok(format!("v1:{}", BASE64_STANDARD.encode(payload)))
}

fn decrypt_value(app: &AppHandle, encrypted: &str) -> Result<String, String> {
    let value = encrypted
        .strip_prefix("v1:")
        .ok_or_else(|| "Formato de valor seguro invalido.".to_string())?;

    let payload = BASE64_STANDARD
        .decode(value)
        .map_err(|error| format!("No fue posible decodificar valor seguro: {error}"))?;
    if payload.len() <= 12 {
        return Err("Payload de cifrado invalido.".to_string());
    }

    let (nonce_bytes, ciphertext) = payload.split_at(12);
    let key = derive_encryption_key(app);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|error| format!("No fue posible inicializar cifrado AES-GCM: {error}"))?;

    let nonce = Nonce::from_slice(nonce_bytes);
    let decrypted = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|error| format!("No fue posible descifrar valor seguro: {error}"))?;

    String::from_utf8(decrypted).map_err(|error| format!("Valor seguro no valido UTF-8: {error}"))
}

fn load_secure_store(app: &AppHandle) -> Result<SecureStore, String> {
    let store_path = secure_store_file_path(app)?;
    if !store_path.exists() {
        return Ok(SecureStore::default());
    }

    let raw = fs::read_to_string(&store_path)
        .map_err(|error| format!("No fue posible leer secure storage: {error}"))?;
    let parsed: SecureStore = serde_json::from_str(&raw)
        .map_err(|error| format!("No fue posible parsear secure storage: {error}"))?;
    Ok(parsed)
}

fn save_secure_store(app: &AppHandle, store: &SecureStore) -> Result<(), String> {
    let store_path = secure_store_file_path(app)?;
    ensure_parent_dir_exists(&store_path)?;
    let payload = serde_json::to_string_pretty(store)
        .map_err(|error| format!("No fue posible serializar secure storage: {error}"))?;

    fs::write(store_path, payload)
        .map_err(|error| format!("No fue posible guardar secure storage: {error}"))
}

fn sqlite_open_connection(app: &AppHandle) -> Result<Connection, String> {
    let path = db_file_path(app)?;
    ensure_parent_dir_exists(&path)?;
    let connection = Connection::open(path).map_err(|error| {
        format!("No fue posible abrir la base SQLite local de AtlasERP Desktop: {error}")
    })?;

    connection
        .execute_batch(
            "
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;
            PRAGMA synchronous = NORMAL;
            ",
        )
        .map_err(|error| format!("No fue posible aplicar PRAGMAs base de SQLite: {error}"))?;

    Ok(connection)
}

fn sqlite_value_to_json(value: ValueRef<'_>) -> serde_json::Value {
    match value {
        ValueRef::Null => serde_json::Value::Null,
        ValueRef::Integer(v) => serde_json::Value::from(v),
        ValueRef::Real(v) => serde_json::Value::from(v),
        ValueRef::Text(v) => serde_json::Value::from(String::from_utf8_lossy(v).to_string()),
        ValueRef::Blob(v) => serde_json::Value::from(BASE64_STANDARD.encode(v)),
    }
}

fn ensure_migration_tracking_table(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            "
            CREATE TABLE IF NOT EXISTS __atlaserp_migrations (
              id TEXT PRIMARY KEY,
              description TEXT NOT NULL,
              applied_at TEXT NOT NULL
            );
            ",
        )
        .map_err(|error| format!("No fue posible preparar tabla de migraciones SQLite: {error}"))
}

fn apply_local_migrations(connection: &mut Connection) -> Result<Vec<String>, String> {
    ensure_migration_tracking_table(connection)?;
    let transaction = connection
        .transaction()
        .map_err(|error| format!("No fue posible iniciar transaccion de migraciones: {error}"))?;

    let mut applied = Vec::new();
    for migration in LOCAL_MIGRATIONS {
        let exists: Option<String> = transaction
            .query_row(
                "SELECT id FROM __atlaserp_migrations WHERE id = ?1",
                [migration.id],
                |row| row.get(0),
            )
            .optional()
            .map_err(|error| {
                format!(
                    "No fue posible verificar migracion local '{}' : {error}",
                    migration.id
                )
            })?;

        if exists.is_some() {
            continue;
        }

        transaction.execute_batch(migration.sql).map_err(|error| {
            format!(
                "No fue posible ejecutar migracion local '{}' : {error}",
                migration.id
            )
        })?;

        transaction
            .execute(
                "INSERT INTO __atlaserp_migrations (id, description, applied_at) VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))",
                params![migration.id, migration.description],
            )
            .map_err(|error| {
                format!(
                    "No fue posible registrar migracion local '{}' : {error}",
                    migration.id
                )
            })?;

        applied.push(migration.id.to_string());
    }

    transaction
        .commit()
        .map_err(|error| format!("No fue posible confirmar migraciones SQLite: {error}"))?;

    Ok(applied)
}

fn sanitize_export_name(file_name: &str, required_extension: &str) -> String {
    let mut sanitized: String = file_name
        .chars()
        .map(|character| match character {
            'a'..='z' | 'A'..='Z' | '0'..='9' | '-' | '_' | '.' => character,
            _ => '_',
        })
        .collect();

    if sanitized.trim().is_empty() {
        sanitized = "export".to_string();
    }

    if !sanitized.ends_with(required_extension) {
        sanitized.push_str(required_extension);
    }

    sanitized
}

fn can_reach_network_probe() -> bool {
    let timeout = Duration::from_millis(1200);
    let targets = ["1.1.1.1:53", "8.8.8.8:53"];

    targets.iter().any(|target| {
        target
            .to_socket_addrs()
            .ok()
            .and_then(|mut addresses| addresses.next())
            .map(|address| TcpStream::connect_timeout(&address, timeout).is_ok())
            .unwrap_or(false)
    })
}

fn map_sync_queue_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<SyncQueueItem> {
    Ok(SyncQueueItem {
        id: row.get(0)?,
        entity: row.get(1)?,
        operation: row.get(2)?,
        payload_json: row.get(3)?,
        status: row.get(4)?,
        attempts: row.get(5)?,
        priority: row.get(6)?,
        last_error: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
    })
}

fn map_sync_queue_storage_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<SyncQueueStorageItem> {
    Ok(SyncQueueStorageItem {
        id: row.get(0)?,
        item_id: row.get(1)?,
        entity: row.get(2)?,
        entity_id: row.get(3)?,
        operation: row.get(4)?,
        payload_json: row.get(5)?,
        source: row.get(6)?,
        occurred_at: row.get(7)?,
        idempotency_key: row.get(8)?,
        fingerprint: row.get(9)?,
        approval_status: row.get(10)?,
        approval_reason: row.get(11)?,
        status: row.get(12)?,
        attempts: row.get(13)?,
        priority: row.get(14)?,
        retry_at: row.get(15)?,
        last_error: row.get(16)?,
        created_at: row.get(17)?,
        updated_at: row.get(18)?,
    })
}

fn map_desktop_log_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<DesktopLogEntry> {
    Ok(DesktopLogEntry {
        id: row.get(0)?,
        level: row.get(1)?,
        module: row.get(2)?,
        message: row.get(3)?,
        context_json: row.get(4)?,
        created_at: row.get(5)?,
    })
}

fn map_sync_conflict_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<SyncConflictItem> {
    Ok(SyncConflictItem {
        id: row.get(0)?,
        entity: row.get(1)?,
        entity_id: row.get(2)?,
        local_payload_json: row.get(3)?,
        remote_payload_json: row.get(4)?,
        reason: row.get(5)?,
        source: row.get(6)?,
        status: row.get(7)?,
        resolution: row.get(8)?,
        merged_payload_json: row.get(9)?,
        created_at: row.get(10)?,
        updated_at: row.get(11)?,
    })
}

pub fn bootstrap_app_dirs(app: &AppHandle) -> Result<(), String> {
    let paths = build_desktop_paths(app)?;
    let app_data = PathBuf::from(&paths.app_data_dir);
    let files = PathBuf::from(&paths.files_dir);
    let exports = PathBuf::from(&paths.exports_dir);
    let queue = PathBuf::from(&paths.queue_dir);
    let cache = PathBuf::from(&paths.cache_dir);
    let logs = PathBuf::from(&paths.logs_dir);
    let attachments = PathBuf::from(&paths.attachments_dir);
    let tmp = PathBuf::from(&paths.tmp_dir);

    fs::create_dir_all(app_data)
        .map_err(|error| format!("No fue posible crear app_data_dir de desktop: {error}"))?;
    fs::create_dir_all(files)
        .map_err(|error| format!("No fue posible crear directorio local de archivos: {error}"))?;
    fs::create_dir_all(exports).map_err(|error| {
        format!("No fue posible crear directorio local de exportaciones: {error}")
    })?;
    fs::create_dir_all(queue)
        .map_err(|error| format!("No fue posible crear directorio local de cola: {error}"))?;
    fs::create_dir_all(cache)
        .map_err(|error| format!("No fue posible crear directorio local de cache: {error}"))?;
    fs::create_dir_all(logs)
        .map_err(|error| format!("No fue posible crear directorio local de logs: {error}"))?;
    fs::create_dir_all(attachments).map_err(|error| {
        format!("No fue posible crear directorio local de adjuntos: {error}")
    })?;
    fs::create_dir_all(tmp)
        .map_err(|error| format!("No fue posible crear directorio local temporal: {error}"))?;

    ensure_parent_dir_exists(&db_file_path(app)?)?;
    ensure_parent_dir_exists(&secure_store_file_path(app)?)?;

    let mut connection = sqlite_open_connection(app)?;
    let _ = apply_local_migrations(&mut connection)?;

    Ok(())
}

#[tauri::command]
pub fn secure_storage_set(
    app: AppHandle,
    namespace: String,
    key: String,
    value: String,
) -> Result<bool, String> {
    let mut store = load_secure_store(&app)?;
    let secure_key = secure_store_compound_key(&namespace, &key);
    let encrypted = encrypt_value(&app, &value)?;

    store.values.insert(secure_key, encrypted);
    save_secure_store(&app, &store)?;

    Ok(true)
}

#[tauri::command]
pub fn secure_storage_get(
    app: AppHandle,
    namespace: String,
    key: String,
) -> Result<Option<String>, String> {
    let store = load_secure_store(&app)?;
    let secure_key = secure_store_compound_key(&namespace, &key);

    match store.values.get(&secure_key) {
        Some(encrypted) => Ok(Some(decrypt_value(&app, encrypted)?)),
        None => Ok(None),
    }
}

#[tauri::command]
pub fn secure_storage_remove(
    app: AppHandle,
    namespace: String,
    key: String,
) -> Result<bool, String> {
    let mut store = load_secure_store(&app)?;
    let secure_key = secure_store_compound_key(&namespace, &key);
    store.values.remove(&secure_key);
    save_secure_store(&app, &store)?;
    Ok(true)
}

#[tauri::command]
pub fn sqlite_init(app: AppHandle) -> Result<String, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    Ok(db_file_path(&app)?.to_string_lossy().to_string())
}

#[tauri::command]
pub fn sqlite_apply_migrations(app: AppHandle) -> Result<Vec<String>, String> {
    let mut connection = sqlite_open_connection(&app)?;
    apply_local_migrations(&mut connection)
}

#[tauri::command]
pub fn sqlite_list_migrations(app: AppHandle) -> Result<Vec<String>, String> {
    let connection = sqlite_open_connection(&app)?;
    ensure_migration_tracking_table(&connection)?;
    let mut statement = connection
        .prepare("SELECT id FROM __atlaserp_migrations ORDER BY applied_at ASC")
        .map_err(|error| format!("No fue posible preparar query de migraciones SQLite: {error}"))?;

    let rows = statement
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|error| format!("No fue posible consultar migraciones SQLite: {error}"))?;

    let mut output = Vec::new();
    for row in rows {
        output.push(row.map_err(|error| format!("No fue posible leer fila de migracion: {error}"))?);
    }

    Ok(output)
}

#[tauri::command]
pub fn sqlite_execute(app: AppHandle, sql: String, params: Vec<String>) -> Result<u64, String> {
    let connection = sqlite_open_connection(&app)?;
    let affected = connection
        .execute(&sql, params_from_iter(params.iter()))
        .map_err(|error| format!("Error al ejecutar SQL local: {error}"))?;

    Ok(affected as u64)
}

#[tauri::command]
pub fn sqlite_execute_batch(app: AppHandle, sql_batch: String) -> Result<bool, String> {
    let connection = sqlite_open_connection(&app)?;
    connection
        .execute_batch(&sql_batch)
        .map_err(|error| format!("Error al ejecutar SQL batch local: {error}"))?;

    Ok(true)
}

#[tauri::command]
pub fn sqlite_query(
    app: AppHandle,
    sql: String,
    params: Vec<String>,
) -> Result<Vec<HashMap<String, serde_json::Value>>, String> {
    let connection = sqlite_open_connection(&app)?;
    let mut statement = connection
        .prepare(&sql)
        .map_err(|error| format!("No fue posible preparar query local: {error}"))?;
    let columns: Vec<String> = statement
        .column_names()
        .iter()
        .map(|column| column.to_string())
        .collect();

    let mut rows = statement
        .query(params_from_iter(params.iter()))
        .map_err(|error| format!("No fue posible ejecutar query local: {error}"))?;

    let mut output = Vec::new();
    while let Some(row) = rows
        .next()
        .map_err(|error| format!("Error al iterar filas SQLite: {error}"))?
    {
        let mut parsed_row = HashMap::new();
        for (index, column) in columns.iter().enumerate() {
            let value = row
                .get_ref(index)
                .map_err(|error| format!("No fue posible leer columna '{column}': {error}"))?;
            parsed_row.insert(column.clone(), sqlite_value_to_json(value));
        }
        output.push(parsed_row);
    }

    Ok(output)
}

#[tauri::command]
pub fn files_write_text(
    app: AppHandle,
    relative_path: String,
    content: String,
) -> Result<bool, String> {
    let files_root = files_root_path(&app)?;
    let safe_relative_path = validate_relative_path(&relative_path)?;
    let file_path = files_root.join(safe_relative_path);
    ensure_parent_dir_exists(&file_path)?;

    fs::write(file_path, content)
        .map_err(|error| format!("No fue posible escribir archivo local: {error}"))?;
    Ok(true)
}

#[tauri::command]
pub fn files_read_text(app: AppHandle, relative_path: String) -> Result<String, String> {
    let files_root = files_root_path(&app)?;
    let safe_relative_path = validate_relative_path(&relative_path)?;
    let file_path = files_root.join(safe_relative_path);

    fs::read_to_string(file_path)
        .map_err(|error| format!("No fue posible leer archivo local: {error}"))
}

#[tauri::command]
pub fn files_delete(app: AppHandle, relative_path: String) -> Result<bool, String> {
    let files_root = files_root_path(&app)?;
    let safe_relative_path = validate_relative_path(&relative_path)?;
    let file_path = files_root.join(safe_relative_path);

    if file_path.exists() {
        fs::remove_file(file_path)
            .map_err(|error| format!("No fue posible eliminar archivo local: {error}"))?;
    }

    Ok(true)
}

#[tauri::command]
pub fn files_exists(app: AppHandle, relative_path: String) -> Result<bool, String> {
    let files_root = files_root_path(&app)?;
    let safe_relative_path = validate_relative_path(&relative_path)?;
    let file_path = files_root.join(safe_relative_path);
    Ok(file_path.exists())
}

#[tauri::command]
pub fn export_rows_to_csv(
    app: AppHandle,
    file_name: String,
    headers: Vec<String>,
    rows: Vec<Vec<String>>,
) -> Result<String, String> {
    let exports_root = exports_root_path(&app)?;
    fs::create_dir_all(&exports_root)
        .map_err(|error| format!("No fue posible preparar directorio de exportaciones: {error}"))?;

    let safe_file_name = sanitize_export_name(&file_name, ".csv");
    let output_path = exports_root.join(safe_file_name);
    let mut writer = csv::Writer::from_path(&output_path)
        .map_err(|error| format!("No fue posible abrir writer CSV local: {error}"))?;

    if !headers.is_empty() {
        writer
            .write_record(headers)
            .map_err(|error| format!("No fue posible escribir headers CSV: {error}"))?;
    }

    for row in rows {
        writer
            .write_record(row)
            .map_err(|error| format!("No fue posible escribir fila CSV: {error}"))?;
    }

    writer
        .flush()
        .map_err(|error| format!("No fue posible cerrar exportacion CSV: {error}"))?;

    Ok(output_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn export_json_document(
    app: AppHandle,
    file_name: String,
    payload: serde_json::Value,
) -> Result<String, String> {
    let exports_root = exports_root_path(&app)?;
    fs::create_dir_all(&exports_root)
        .map_err(|error| format!("No fue posible preparar directorio de exportaciones: {error}"))?;

    let safe_file_name = sanitize_export_name(&file_name, ".json");
    let output_path = exports_root.join(safe_file_name);
    let mut file = fs::File::create(&output_path)
        .map_err(|error| format!("No fue posible crear exportacion JSON: {error}"))?;

    let content = serde_json::to_string_pretty(&payload)
        .map_err(|error| format!("No fue posible serializar exportacion JSON: {error}"))?;
    file.write_all(content.as_bytes())
        .map_err(|error| format!("No fue posible escribir exportacion JSON: {error}"))?;

    Ok(output_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn print_request(document_name: String) -> Result<PrintRequestResult, String> {
    let normalized_name = document_name.trim();
    if normalized_name.is_empty() {
        return Err("El nombre del documento a imprimir no puede estar vacio.".to_string());
    }

    Ok(PrintRequestResult {
        accepted: true,
        detail: format!(
            "Solicitud de impresion registrada para '{normalized_name}'. Integracion nativa detallada pendiente de bloque de hardening."
        ),
    })
}

#[tauri::command]
pub fn network_status() -> Result<NetworkStatus, String> {
    let online = can_reach_network_probe();
    Ok(NetworkStatus {
        online,
        checked_at: now_unix_seconds(),
        mode: "tcp-probe:53".to_string(),
    })
}

#[tauri::command]
pub fn updater_get_status(app: AppHandle) -> Result<UpdaterStatus, String> {
    Ok(UpdaterStatus {
        channel: "stable".to_string(),
        current_version: app.package_info().version.to_string(),
        auto_update_enabled: false,
        supports_background: false,
        provider: "future-tauri-updater".to_string(),
    })
}

#[tauri::command]
pub fn updater_check_for_updates(_app: AppHandle) -> Result<UpdaterCheckResult, String> {
    Ok(UpdaterCheckResult {
        checked_at: now_unix_seconds(),
        update_available: false,
        latest_version: None,
        notes: "Bridge base listo. Integracion real de updates quedara activa cuando CI/CD y firma de binarios esten habilitados.".to_string(),
    })
}

#[tauri::command]
pub fn desktop_get_paths(app: AppHandle) -> Result<DesktopPaths, String> {
    build_desktop_paths(&app)
}

#[tauri::command]
pub fn desktop_prepare_data_dirs(app: AppHandle) -> Result<DesktopPaths, String> {
    bootstrap_app_dirs(&app)?;
    build_desktop_paths(&app)
}

#[tauri::command]
pub fn sync_queue_enqueue(
    app: AppHandle,
    entity: String,
    operation: String,
    payload_json: String,
    priority: Option<i64>,
) -> Result<i64, String> {
    let entity_normalized = entity.trim();
    let operation_normalized = operation.trim();
    let payload_normalized = payload_json.trim();
    if entity_normalized.is_empty() || operation_normalized.is_empty() || payload_normalized.is_empty() {
        return Err("entity, operation y payload_json son obligatorios para la cola local.".to_string());
    }

    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    connection
        .execute(
            "INSERT INTO sync_queue (
                entity, operation, payload_json, status, attempts, priority, created_at, updated_at
             ) VALUES (
                ?1, ?2, ?3, 'pending', 0, ?4, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             )",
            params![entity_normalized, operation_normalized, payload_normalized, priority.unwrap_or(100)],
        )
        .map_err(|error| format!("No fue posible insertar item en sync_queue local: {error}"))?;

    Ok(connection.last_insert_rowid())
}

#[tauri::command]
pub fn sync_queue_list(
    app: AppHandle,
    status: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<SyncQueueItem>, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let safe_limit = i64::from(limit.unwrap_or(100).clamp(1, 500));

    let query_with_status = "
        SELECT id, entity, operation, payload_json, status, attempts, priority, last_error, created_at, updated_at
        FROM sync_queue
        WHERE status = ?1
        ORDER BY priority ASC, id ASC
        LIMIT ?2
    ";
    let query_without_status = "
        SELECT id, entity, operation, payload_json, status, attempts, priority, last_error, created_at, updated_at
        FROM sync_queue
        ORDER BY priority ASC, id ASC
        LIMIT ?1
    ";

    let mut output = Vec::new();
    if let Some(status_filter) = status {
        let normalized = status_filter.trim();
        let mut statement = connection
            .prepare(query_with_status)
            .map_err(|error| format!("No fue posible preparar query sync_queue filtrada: {error}"))?;
        let rows = statement
            .query_map(params![normalized, safe_limit], map_sync_queue_row)
            .map_err(|error| format!("No fue posible consultar sync_queue filtrada: {error}"))?;

        for row in rows {
            output.push(row.map_err(|error| format!("No fue posible leer fila sync_queue: {error}"))?);
        }
    } else {
        let mut statement = connection
            .prepare(query_without_status)
            .map_err(|error| format!("No fue posible preparar query sync_queue: {error}"))?;
        let rows = statement
            .query_map(params![safe_limit], map_sync_queue_row)
            .map_err(|error| format!("No fue posible consultar sync_queue: {error}"))?;

        for row in rows {
            output.push(row.map_err(|error| format!("No fue posible leer fila sync_queue: {error}"))?);
        }
    }

    Ok(output)
}

#[tauri::command]
pub fn sync_queue_mark_processing(app: AppHandle, id: i64) -> Result<bool, String> {
    let connection = sqlite_open_connection(&app)?;
    let affected = connection
        .execute(
            "UPDATE sync_queue
             SET status = 'processing',
                 attempts = attempts + 1,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?1 AND status IN ('pending', 'failed')",
            params![id],
        )
        .map_err(|error| format!("No fue posible marcar item sync_queue como processing: {error}"))?;
    Ok(affected > 0)
}

#[tauri::command]
pub fn sync_queue_mark_done(app: AppHandle, id: i64) -> Result<bool, String> {
    let connection = sqlite_open_connection(&app)?;
    let affected = connection
        .execute(
            "UPDATE sync_queue
             SET status = 'done',
                 last_error = NULL,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?1",
            params![id],
        )
        .map_err(|error| format!("No fue posible marcar item sync_queue como done: {error}"))?;
    Ok(affected > 0)
}

#[tauri::command]
pub fn sync_queue_mark_failed(
    app: AppHandle,
    id: i64,
    last_error: Option<String>,
) -> Result<bool, String> {
    let connection = sqlite_open_connection(&app)?;
    let affected = connection
        .execute(
            "UPDATE sync_queue
             SET status = 'failed',
                 last_error = ?2,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?1",
            params![id, last_error],
        )
        .map_err(|error| format!("No fue posible marcar item sync_queue como failed: {error}"))?;
    Ok(affected > 0)
}

#[tauri::command]
pub fn sync_queue_pending_count(app: AppHandle) -> Result<i64, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let count: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM sync_queue WHERE status IN ('pending', 'processing', 'failed')",
            [],
            |row| row.get(0),
        )
        .map_err(|error| format!("No fue posible consultar conteo pendiente de sync_queue: {error}"))?;
    Ok(count)
}

#[tauri::command]
pub fn sync_queue_summary(app: AppHandle) -> Result<SyncQueueSummary, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;

    let count_by_status = |status: &str| -> Result<i64, String> {
        connection
            .query_row(
                "SELECT COUNT(*) FROM sync_queue WHERE status = ?1",
                params![status],
                |row| row.get(0),
            )
            .map_err(|error| format!("No fue posible consultar conteo de status '{status}': {error}"))
    };

    let pending = count_by_status("pending")?;
    let processing = count_by_status("processing")?;
    let failed = count_by_status("failed")?;
    let done = count_by_status("done")?;
    let total = pending + processing + failed + done;

    Ok(SyncQueueSummary {
        pending,
        processing,
        failed,
        done,
        total,
    })
}

#[tauri::command]
pub fn sync_queue_recover_after_restart(app: AppHandle) -> Result<i64, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;

    let affected = connection
        .execute(
            "UPDATE sync_queue
             SET status = 'pending',
                 last_error = COALESCE(last_error, 'Recuperado tras reinicio de app desktop.'),
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE status = 'processing'",
            [],
        )
        .map_err(|error| format!("No fue posible recuperar cola local tras reinicio: {error}"))?;

    Ok(affected as i64)
}

#[tauri::command]
pub fn sync_item_enqueue(
    app: AppHandle,
    item_id: String,
    entity: String,
    entity_id: String,
    operation: String,
    payload_json: String,
    source: Option<String>,
    occurred_at: String,
    idempotency_key: String,
    fingerprint: String,
    priority: Option<i64>,
    approval_status: Option<String>,
    approval_reason: Option<String>,
) -> Result<i64, String> {
    let item_id_normalized = item_id.trim();
    let entity_normalized = entity.trim();
    let entity_id_normalized = entity_id.trim();
    let operation_normalized = operation.trim();
    let payload_normalized = payload_json.trim();
    let source_normalized = source
        .unwrap_or_else(|| "desktop".to_string())
        .trim()
        .to_string();
    let occurred_at_normalized = occurred_at.trim();
    let idempotency_key_normalized = idempotency_key.trim();
    let fingerprint_normalized = fingerprint.trim();

    if item_id_normalized.is_empty()
        || entity_normalized.is_empty()
        || entity_id_normalized.is_empty()
        || operation_normalized.is_empty()
        || payload_normalized.is_empty()
        || source_normalized.is_empty()
        || occurred_at_normalized.is_empty()
        || idempotency_key_normalized.is_empty()
        || fingerprint_normalized.is_empty()
    {
        return Err("item_id, entity, entity_id, operation, payload_json, source, occurred_at, idempotency_key y fingerprint son obligatorios.".to_string());
    }

    let approval = approval_status
        .unwrap_or_else(|| "pending_review".to_string())
        .trim()
        .to_lowercase();

    if !matches!(approval.as_str(), "approved" | "rejected" | "pending_review") {
        return Err("approval_status invalido. Valores permitidos: approved, rejected, pending_review.".to_string());
    }

    let status = if approval == "rejected" {
        "canceled"
    } else {
        "pending"
    };

    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    connection
        .execute(
            "INSERT INTO sync_queue_items (
                item_id, entity, entity_id, operation, payload_json, source, occurred_at,
                idempotency_key, fingerprint, approval_status, approval_reason,
                status, attempts, priority, retry_at, last_error, created_at, updated_at
             ) VALUES (
                ?1, ?2, ?3, ?4, ?5, ?6, ?7,
                ?8, ?9, ?10, ?11,
                ?12, 0, ?13, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             )",
            params![
                item_id_normalized,
                entity_normalized,
                entity_id_normalized,
                operation_normalized,
                payload_normalized,
                source_normalized,
                occurred_at_normalized,
                idempotency_key_normalized,
                fingerprint_normalized,
                approval,
                approval_reason,
                status,
                priority.unwrap_or(100)
            ],
        )
        .map_err(|error| format!("No fue posible insertar sync_queue_item local: {error}"))?;

    Ok(connection.last_insert_rowid())
}

#[tauri::command]
pub fn sync_item_list(
    app: AppHandle,
    status: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<SyncQueueStorageItem>, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let safe_limit = i64::from(limit.unwrap_or(200).clamp(1, 1000));

    let query_with_status = "
        SELECT id, item_id, entity, entity_id, operation, payload_json, source, occurred_at, idempotency_key, fingerprint,
               approval_status, approval_reason, status, attempts, priority, retry_at, last_error, created_at, updated_at
        FROM sync_queue_items
        WHERE status = ?1
        ORDER BY priority ASC, occurred_at ASC, id ASC
        LIMIT ?2
    ";
    let query_without_status = "
        SELECT id, item_id, entity, entity_id, operation, payload_json, source, occurred_at, idempotency_key, fingerprint,
               approval_status, approval_reason, status, attempts, priority, retry_at, last_error, created_at, updated_at
        FROM sync_queue_items
        ORDER BY priority ASC, occurred_at ASC, id ASC
        LIMIT ?1
    ";

    let mut output = Vec::new();
    if let Some(status_filter) = status {
        let normalized = status_filter.trim().to_lowercase();
        let mut statement = connection
            .prepare(query_with_status)
            .map_err(|error| format!("No fue posible preparar query sync_queue_items filtrada: {error}"))?;
        let rows = statement
            .query_map(params![normalized, safe_limit], map_sync_queue_storage_row)
            .map_err(|error| format!("No fue posible consultar sync_queue_items filtrada: {error}"))?;

        for row in rows {
            output.push(
                row.map_err(|error| format!("No fue posible leer fila sync_queue_items: {error}"))?,
            );
        }
    } else {
        let mut statement = connection
            .prepare(query_without_status)
            .map_err(|error| format!("No fue posible preparar query sync_queue_items: {error}"))?;
        let rows = statement
            .query_map(params![safe_limit], map_sync_queue_storage_row)
            .map_err(|error| format!("No fue posible consultar sync_queue_items: {error}"))?;

        for row in rows {
            output.push(
                row.map_err(|error| format!("No fue posible leer fila sync_queue_items: {error}"))?,
            );
        }
    }

    Ok(output)
}

#[tauri::command]
pub fn sync_item_find_by_idempotency_key(
    app: AppHandle,
    idempotency_key: String,
) -> Result<Option<SyncQueueStorageItem>, String> {
    let idempotency_key_normalized = idempotency_key.trim();
    if idempotency_key_normalized.is_empty() {
        return Err("idempotency_key es obligatorio.".to_string());
    }

    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let mut statement = connection
        .prepare(
            "SELECT id, item_id, entity, entity_id, operation, payload_json, source, occurred_at, idempotency_key, fingerprint,
                    approval_status, approval_reason, status, attempts, priority, retry_at, last_error, created_at, updated_at
             FROM sync_queue_items
             WHERE idempotency_key = ?1
             ORDER BY id DESC
             LIMIT 1",
        )
        .map_err(|error| format!("No fue posible preparar query por idempotency_key: {error}"))?;

    let found = statement
        .query_row(params![idempotency_key_normalized], map_sync_queue_storage_row)
        .optional()
        .map_err(|error| format!("No fue posible consultar sync_queue_items por idempotency_key: {error}"))?;

    Ok(found)
}

#[tauri::command]
pub fn sync_item_mark_approved(
    app: AppHandle,
    id: i64,
    reason: Option<String>,
) -> Result<bool, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let affected = connection
        .execute(
            "UPDATE sync_queue_items
             SET approval_status = 'approved',
                 approval_reason = COALESCE(?2, approval_reason),
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?1 AND status != 'canceled'",
            params![id, reason],
        )
        .map_err(|error| format!("No fue posible aprobar sync_queue_item: {error}"))?;

    Ok(affected > 0)
}

#[tauri::command]
pub fn sync_item_mark_rejected(app: AppHandle, id: i64, reason: String) -> Result<bool, String> {
    let reason_normalized = reason.trim();
    if reason_normalized.is_empty() {
        return Err("reason es obligatorio para rechazar sync_item.".to_string());
    }

    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let affected = connection
        .execute(
            "UPDATE sync_queue_items
             SET approval_status = 'rejected',
                 approval_reason = ?2,
                 status = 'canceled',
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?1",
            params![id, reason_normalized],
        )
        .map_err(|error| format!("No fue posible rechazar sync_queue_item: {error}"))?;

    Ok(affected > 0)
}

#[tauri::command]
pub fn sync_item_pending_count(app: AppHandle) -> Result<i64, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let count: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM sync_queue_items WHERE status IN ('pending', 'processing', 'failed')",
            [],
            |row| row.get(0),
        )
        .map_err(|error| format!("No fue posible consultar conteo pendiente de sync_queue_items: {error}"))?;

    Ok(count)
}

/// Lista items aprobados y en estado pending, listos para enviar al backend.
/// Usado por el dequeue service (T-1015).
#[tauri::command]
pub fn sync_item_list_ready(
    app: AppHandle,
    limit: Option<u32>,
) -> Result<Vec<SyncQueueStorageItem>, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let safe_limit = i64::from(limit.unwrap_or(50).clamp(1, 200));

    let mut statement = connection
        .prepare(
            "SELECT id, item_id, entity, entity_id, operation, payload_json, source, occurred_at, idempotency_key, fingerprint,
                    approval_status, approval_reason, status, attempts, priority, retry_at, last_error, created_at, updated_at
             FROM sync_queue_items
             WHERE status = 'pending' AND approval_status = 'approved'
             ORDER BY priority ASC, occurred_at ASC, id ASC
             LIMIT ?1",
        )
        .map_err(|error| format!("No fue posible preparar query sync_item_list_ready: {error}"))?;

    let mut output = Vec::new();
    let rows = statement
        .query_map(params![safe_limit], map_sync_queue_storage_row)
        .map_err(|error| format!("No fue posible consultar sync_item_list_ready: {error}"))?;

    for row in rows {
        output.push(row.map_err(|error| format!("No fue posible leer fila sync_item_list_ready: {error}"))?);
    }

    Ok(output)
}

/// Marca un item como 'processing' e incrementa el contador de intentos.
#[tauri::command]
pub fn sync_item_mark_processing(app: AppHandle, id: i64) -> Result<bool, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let affected = connection
        .execute(
            "UPDATE sync_queue_items
             SET status = 'processing',
                 attempts = attempts + 1,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?1 AND status IN ('pending', 'failed') AND approval_status = 'approved'",
            params![id],
        )
        .map_err(|error| format!("No fue posible marcar sync_item como processing: {error}"))?;

    Ok(affected > 0)
}

/// Marca un item como 'done' tras sincronizacion exitosa.
#[tauri::command]
pub fn sync_item_mark_done(
    app: AppHandle,
    id: i64,
    session_ref: Option<String>,
) -> Result<bool, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let affected = connection
        .execute(
            "UPDATE sync_queue_items
             SET status = 'done',
                 last_error = NULL,
                 approval_reason = COALESCE(?2, approval_reason),
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?1",
            params![id, session_ref],
        )
        .map_err(|error| format!("No fue posible marcar sync_item como done: {error}"))?;

    Ok(affected > 0)
}

/// Marca un item como 'failed' y calcula retry_at con backoff exponencial (max 1h).
#[tauri::command]
pub fn sync_item_mark_failed(
    app: AppHandle,
    id: i64,
    last_error: Option<String>,
) -> Result<bool, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    // Backoff: base 30s * 2^(attempts-1), capped at 3600s
    // We compute a simple fixed delay in seconds using SQLite arithmetic.
    // retry_at = now + min(30 * power(2, attempts - 1), 3600) seconds
    let affected = connection
        .execute(
            "UPDATE sync_queue_items
             SET status = 'failed',
                 last_error = ?2,
                 retry_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now',
                     '+' || CAST(MIN(30 * POWER(2, MAX(attempts - 1, 0)), 3600) AS INTEGER) || ' seconds'),
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?1",
            params![id, last_error],
        )
        .map_err(|error| format!("No fue posible marcar sync_item como failed: {error}"))?;

    Ok(affected > 0)
}

#[tauri::command]
pub fn desktop_log_append(
    app: AppHandle,
    level: String,
    module: String,
    message: String,
    context_json: Option<String>,
) -> Result<i64, String> {
    let level_normalized = level.trim().to_lowercase();
    let module_normalized = module.trim();
    let message_normalized = message.trim();
    if level_normalized.is_empty() || module_normalized.is_empty() || message_normalized.is_empty() {
        return Err("level, module y message son obligatorios para desktop_log_append.".to_string());
    }

    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    connection
        .execute(
            "INSERT INTO desktop_logs (level, module, message, context_json, created_at)
             VALUES (?1, ?2, ?3, ?4, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))",
            params![level_normalized, module_normalized, message_normalized, context_json],
        )
        .map_err(|error| format!("No fue posible insertar log desktop: {error}"))?;

    Ok(connection.last_insert_rowid())
}

#[tauri::command]
pub fn desktop_log_list(
    app: AppHandle,
    level: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<DesktopLogEntry>, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let safe_limit = i64::from(limit.unwrap_or(200).clamp(1, 1000));

    let query_with_level = "
        SELECT id, level, module, message, context_json, created_at
        FROM desktop_logs
        WHERE level = ?1
        ORDER BY id DESC
        LIMIT ?2
    ";
    let query_without_level = "
        SELECT id, level, module, message, context_json, created_at
        FROM desktop_logs
        ORDER BY id DESC
        LIMIT ?1
    ";

    let mut output = Vec::new();
    if let Some(level_filter) = level {
        let normalized = level_filter.trim().to_lowercase();
        let mut statement = connection
            .prepare(query_with_level)
            .map_err(|error| format!("No fue posible preparar query de logs con nivel: {error}"))?;
        let rows = statement
            .query_map(params![normalized, safe_limit], map_desktop_log_row)
            .map_err(|error| format!("No fue posible consultar logs con nivel: {error}"))?;
        for row in rows {
            output.push(row.map_err(|error| format!("No fue posible leer fila de log: {error}"))?);
        }
    } else {
        let mut statement = connection
            .prepare(query_without_level)
            .map_err(|error| format!("No fue posible preparar query de logs: {error}"))?;
        let rows = statement
            .query_map(params![safe_limit], map_desktop_log_row)
            .map_err(|error| format!("No fue posible consultar logs: {error}"))?;
        for row in rows {
            output.push(row.map_err(|error| format!("No fue posible leer fila de log: {error}"))?);
        }
    }

    Ok(output)
}

#[tauri::command]
pub fn desktop_log_rotate(app: AppHandle, max_records: Option<u32>) -> Result<i64, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let keep = i64::from(max_records.unwrap_or(5000).clamp(100, 50000));

    let affected = connection
        .execute(
            "DELETE FROM desktop_logs
             WHERE id NOT IN (
               SELECT id FROM desktop_logs
               ORDER BY id DESC
               LIMIT ?1
             )",
            params![keep],
        )
        .map_err(|error| format!("No fue posible rotar logs desktop: {error}"))?;

    Ok(affected as i64)
}

#[tauri::command]
pub fn sync_conflict_store(
    app: AppHandle,
    entity: String,
    entity_id: String,
    local_payload_json: String,
    remote_payload_json: String,
    reason: String,
    source: Option<String>,
) -> Result<i64, String> {
    let entity_normalized = entity.trim();
    let entity_id_normalized = entity_id.trim();
    let local_payload = local_payload_json.trim();
    let remote_payload = remote_payload_json.trim();
    let reason_normalized = reason.trim();
    if entity_normalized.is_empty()
        || entity_id_normalized.is_empty()
        || local_payload.is_empty()
        || remote_payload.is_empty()
        || reason_normalized.is_empty()
    {
        return Err("entity, entity_id, local_payload_json, remote_payload_json y reason son obligatorios.".to_string());
    }

    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    connection
        .execute(
            "INSERT INTO sync_conflicts (
                entity, entity_id, local_payload_json, remote_payload_json, reason, source, status, created_at, updated_at
             ) VALUES (
                ?1, ?2, ?3, ?4, ?5, ?6, 'pending', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             )",
            params![
                entity_normalized,
                entity_id_normalized,
                local_payload,
                remote_payload,
                reason_normalized,
                source.unwrap_or_else(|| "download".to_string())
            ],
        )
        .map_err(|error| format!("No fue posible almacenar conflicto de sync: {error}"))?;

    Ok(connection.last_insert_rowid())
}

#[tauri::command]
pub fn sync_conflict_list(
    app: AppHandle,
    status: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<SyncConflictItem>, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let safe_limit = i64::from(limit.unwrap_or(200).clamp(1, 1000));

    let query_with_status = "
        SELECT id, entity, entity_id, local_payload_json, remote_payload_json, reason, source, status, resolution, merged_payload_json, created_at, updated_at
        FROM sync_conflicts
        WHERE status = ?1
        ORDER BY id DESC
        LIMIT ?2
    ";
    let query_without_status = "
        SELECT id, entity, entity_id, local_payload_json, remote_payload_json, reason, source, status, resolution, merged_payload_json, created_at, updated_at
        FROM sync_conflicts
        ORDER BY id DESC
        LIMIT ?1
    ";

    let mut output = Vec::new();
    if let Some(status_filter) = status {
        let normalized = status_filter.trim().to_lowercase();
        let mut statement = connection
            .prepare(query_with_status)
            .map_err(|error| format!("No fue posible preparar query de conflictos filtrada: {error}"))?;
        let rows = statement
            .query_map(params![normalized, safe_limit], map_sync_conflict_row)
            .map_err(|error| format!("No fue posible consultar conflictos filtrados: {error}"))?;
        for row in rows {
            output.push(row.map_err(|error| format!("No fue posible leer fila de conflicto: {error}"))?);
        }
    } else {
        let mut statement = connection
            .prepare(query_without_status)
            .map_err(|error| format!("No fue posible preparar query de conflictos: {error}"))?;
        let rows = statement
            .query_map(params![safe_limit], map_sync_conflict_row)
            .map_err(|error| format!("No fue posible consultar conflictos: {error}"))?;
        for row in rows {
            output.push(row.map_err(|error| format!("No fue posible leer fila de conflicto: {error}"))?);
        }
    }

    Ok(output)
}

#[tauri::command]
pub fn sync_conflict_mark_resolved(
    app: AppHandle,
    id: i64,
    resolution: String,
    merged_payload_json: Option<String>,
) -> Result<bool, String> {
    let resolution_normalized = resolution.trim();
    if resolution_normalized.is_empty() {
        return Err("resolution es obligatorio para cerrar un conflicto.".to_string());
    }

    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let affected = connection
        .execute(
            "UPDATE sync_conflicts
             SET status = 'resolved',
                 resolution = ?2,
                 merged_payload_json = ?3,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?1",
            params![id, resolution_normalized, merged_payload_json],
        )
        .map_err(|error| format!("No fue posible cerrar conflicto de sync: {error}"))?;
    Ok(affected > 0)
}

#[tauri::command]
pub fn sync_conflict_pending_count(app: AppHandle) -> Result<i64, String> {
    let mut connection = sqlite_open_connection(&app)?;
    let _ = apply_local_migrations(&mut connection)?;
    let count: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM sync_conflicts WHERE status = 'pending'",
            [],
            |row| row.get(0),
        )
        .map_err(|error| format!("No fue posible consultar conteo pendiente de conflictos: {error}"))?;
    Ok(count)
}
