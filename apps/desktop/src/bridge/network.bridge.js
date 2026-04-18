import { invokeDesktop } from "./desktopBridge.js";

export async function getDesktopNetworkStatus() {
  return invokeDesktop(
    "network_status",
    {},
    () => ({
      online: navigator.onLine,
      checkedAt: Date.now(),
      mode: "browser-fallback",
    }),
  );
}

export function subscribeBrowserNetworkStatus(onChange) {
  const handler = () => {
    onChange(navigator.onLine);
  };

  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);

  return () => {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
  };
}
