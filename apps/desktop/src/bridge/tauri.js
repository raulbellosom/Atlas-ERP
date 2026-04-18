export function isTauriDesktop() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function getRuntimeLabel() {
  return isTauriDesktop() ? "Desktop (Tauri)" : "Navegador (modo web)";
}
