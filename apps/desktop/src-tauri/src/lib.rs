// AtlasERP Desktop — Tauri commands y state (stub)
// Los bridges nativos se implementan en Fase 6+ (DesktopAgent).
//
// Estructura esperada final:
//   mod commands;     -- IPC commands expuestos al frontend
//   mod db;           -- SQLite local (cola sync, cache, snapshots)
//   mod network;      -- Deteccion online/offline
//   mod storage;      -- Archivos locales y adjuntos offline
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::secure_storage_set,
            commands::secure_storage_get,
            commands::secure_storage_remove,
            commands::sqlite_init,
            commands::sqlite_apply_migrations,
            commands::sqlite_list_migrations,
            commands::sqlite_execute,
            commands::sqlite_execute_batch,
            commands::sqlite_query,
            commands::files_write_text,
            commands::files_read_text,
            commands::files_delete,
            commands::files_exists,
            commands::export_rows_to_csv,
            commands::export_json_document,
            commands::print_request,
            commands::network_status,
            commands::updater_get_status,
            commands::updater_check_for_updates,
            commands::desktop_get_paths,
            commands::desktop_prepare_data_dirs,
            commands::sync_queue_enqueue,
            commands::sync_queue_list,
            commands::sync_queue_mark_processing,
            commands::sync_queue_mark_done,
            commands::sync_queue_mark_failed,
            commands::sync_queue_pending_count,
            commands::sync_queue_summary,
            commands::sync_queue_recover_after_restart,
            commands::sync_item_enqueue,
            commands::sync_item_list,
            commands::sync_item_list_ready,
            commands::sync_item_find_by_idempotency_key,
            commands::sync_item_mark_approved,
            commands::sync_item_mark_rejected,
            commands::sync_item_mark_processing,
            commands::sync_item_mark_done,
            commands::sync_item_mark_failed,
            commands::sync_item_pending_count,
            commands::desktop_log_append,
            commands::desktop_log_list,
            commands::desktop_log_rotate,
            commands::sync_conflict_store,
            commands::sync_conflict_list,
            commands::sync_conflict_mark_resolved,
            commands::sync_conflict_pending_count
        ])
        .setup(|app| {
            commands::bootstrap_app_dirs(&app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error al iniciar la aplicacion AtlasERP Desktop");
}
