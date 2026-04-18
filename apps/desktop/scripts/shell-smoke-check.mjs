import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function assertIncludes(content, token, context) {
  if (!content.includes(token)) {
    throw new Error(`[ShellSmoke] Falta '${token}' en ${context}.`);
  }
}

async function run() {
  const root = resolve(process.cwd());
  const commandsPath = resolve(root, "src-tauri/src/commands.rs");
  const libPath = resolve(root, "src-tauri/src/lib.rs");
  const appPath = resolve(root, "src/App.jsx");
  const hookPath = resolve(root, "src/hooks/useDesktopBootstrap.js");
  const syncItemsBridgePath = resolve(root, "src/bridge/syncItems.bridge.js");
  const syncItemsRepoPath = resolve(root, "src/modules/sync/localSyncItemsRepository.js");
  const syncEnqueueServicePath = resolve(root, "src/modules/sync/localSyncEnqueueService.js");

  const [commands, lib, app, hook, syncItemsBridge, syncItemsRepo, syncEnqueueService] = await Promise.all([
    readFile(commandsPath, "utf8"),
    readFile(libPath, "utf8"),
    readFile(appPath, "utf8"),
    readFile(hookPath, "utf8"),
    readFile(syncItemsBridgePath, "utf8"),
    readFile(syncItemsRepoPath, "utf8"),
    readFile(syncEnqueueServicePath, "utf8"),
  ]);

  const requiredCommands = [
    "sync_queue_recover_after_restart",
    "sync_queue_summary",
    "desktop_log_append",
    "desktop_log_list",
    "sync_conflict_store",
    "sync_conflict_pending_count",
    "sync_item_enqueue",
    "sync_item_list",
    "sync_item_find_by_idempotency_key",
    "sync_item_mark_approved",
    "sync_item_mark_rejected",
    "sync_item_pending_count",
  ];

  requiredCommands.forEach((command) => {
    assertIncludes(commands, command, "commands.rs");
    assertIncludes(lib, command, "lib.rs");
  });

  assertIncludes(hook, "resolveBootMode", "useDesktopBootstrap.js");
  assertIncludes(hook, "recoverSyncQueueAfterRestart", "useDesktopBootstrap.js");
  assertIncludes(hook, "enqueueSyncItemDraft", "useDesktopBootstrap.js");
  assertIncludes(app, "LocalSyncStatusPanel", "App.jsx");
  assertIncludes(app, "Logs locales desktop", "App.jsx");
  assertIncludes(syncItemsBridge, "syncItemEnqueue", "syncItems.bridge.js");
  assertIncludes(syncItemsRepo, "createSyncItem", "localSyncItemsRepository.js");
  assertIncludes(syncEnqueueService, "enqueueLocalSyncItem", "localSyncEnqueueService.js");

  console.warn("[ShellSmoke] OK - comandos, bootstrap y panel local presentes.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
