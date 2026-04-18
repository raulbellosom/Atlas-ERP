import { invokeDesktop } from "./desktopBridge.js";

export async function sqliteInit() {
  return invokeDesktop("sqlite_init", {}, "web-memory");
}

export async function sqliteApplyMigrations() {
  return invokeDesktop("sqlite_apply_migrations", {}, []);
}

export async function sqliteListMigrations() {
  return invokeDesktop("sqlite_list_migrations", {}, []);
}

export async function sqliteExecute(sql, params = []) {
  return invokeDesktop("sqlite_execute", { sql, params }, 0);
}

export async function sqliteQuery(sql, params = []) {
  return invokeDesktop("sqlite_query", { sql, params }, []);
}

export async function sqliteMigrate(sqlBatch) {
  return invokeDesktop("sqlite_execute_batch", { sqlBatch }, true);
}
