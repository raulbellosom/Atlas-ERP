import { invoke } from "@tauri-apps/api/core";
import { isTauriDesktop } from "./tauri.js";

/**
 * Ejecuta comandos Tauri cuando la app corre como desktop.
 * Si corre en navegador, devuelve fallback para permitir desarrollo web.
 */
export async function invokeDesktop(command, payload = {}, fallback = null) {
  if (!isTauriDesktop()) {
    if (typeof fallback === "function") {
      return fallback();
    }

    return fallback;
  }

  return invoke(command, payload);
}
