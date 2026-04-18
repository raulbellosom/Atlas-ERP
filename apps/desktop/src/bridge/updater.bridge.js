import { invokeDesktop } from "./desktopBridge.js";

export async function getUpdaterStatus() {
  return invokeDesktop(
    "updater_get_status",
    {},
    () => ({
      channel: "stable",
      currentVersion: "web-dev",
      autoUpdateEnabled: false,
      supportsBackground: false,
      provider: "browser-fallback",
    }),
  );
}

export async function checkForUpdates() {
  return invokeDesktop(
    "updater_check_for_updates",
    {},
    () => ({
      checkedAt: Date.now(),
      updateAvailable: false,
      latestVersion: null,
      notes: "Fallback en navegador sin soporte de actualización nativa.",
    }),
  );
}
