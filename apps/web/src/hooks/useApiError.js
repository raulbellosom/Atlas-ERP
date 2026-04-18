import { useCallback, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage, classifyError } from "@/lib/apiErrors";

/**
 * Hook que combina manejo de errores de API con el sistema de toasts.
 *
 * Uso:
 *   const { handleError } = useApiError();
 *   try { await mutate() } catch (err) { handleError(err) }
 *
 * @returns {{ handleError: (err: unknown, fallback?: string) => void }}
 */
export function useApiError() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const lastErrorRef = useRef({ signature: "", at: 0 });

  // Mantener referencia actual al API de toast sin recrear handleError en cada render.
  toastRef.current = toast;

  const handleError = useCallback(
    (err, fallback) => {
      const category = classifyError(err);
      const message = getErrorMessage(err, fallback);

      // Los errores 401 ya los maneja el interceptor de Axios (redirige a login)
      if (category === "auth") return;

      // Evitar ráfagas de toasts idénticos que pueden generar loops de render.
      const signature = `${category}::${message}`;
      const now = Date.now();
      const isDuplicateBurst =
        lastErrorRef.current.signature === signature &&
        now - lastErrorRef.current.at < 1500;

      if (isDuplicateBurst) return;

      lastErrorRef.current = { signature, at: now };
      toastRef.current.error(message);
    },
    [],
  );

  return { handleError };
}
