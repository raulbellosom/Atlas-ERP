import { invokeDesktop } from "./desktopBridge.js";

function browserPathsFallback() {
  return {
    appDataDir: "web://local",
    dbFile: "web://memory",
    secureStoreFile: "web://localStorage",
    filesDir: "web://files",
    exportsDir: "web://exports",
    queueDir: "web://queue",
    cacheDir: "web://cache",
    logsDir: "web://logs",
    attachmentsDir: "web://attachments",
    tmpDir: "web://tmp",
  };
}

export async function getDesktopPaths() {
  return invokeDesktop("desktop_get_paths", {}, browserPathsFallback);
}

export async function prepareDesktopDataDirs() {
  return invokeDesktop("desktop_prepare_data_dirs", {}, browserPathsFallback);
}
