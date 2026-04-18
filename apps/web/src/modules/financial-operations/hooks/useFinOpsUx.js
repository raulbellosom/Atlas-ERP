import { useEffect, useCallback, useState } from "react";

/**
 * useUnsavedChanges — Hook para prevenir pérdida de cambios no guardados.
 *
 * T-1422: Muestra confirmación del navegador si hay cambios sin guardar
 * al intentar navegar fuera o cerrar pestaña.
 *
 * @param {boolean} isDirty — true si hay cambios sin guardar
 * @param {string} message — mensaje de confirmación
 */
export function useUnsavedChanges(isDirty, message = "Tienes cambios sin guardar. ¿Deseas salir?") {
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, message]);
}

/**
 * useOnlineStatus — Hook para detectar estado de conexión.
 *
 * T-1420: Retorna { isOnline, wasOffline } para mostrar indicadores
 * de conectividad en el módulo financiero.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
    };
    const goOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const clearOfflineFlag = useCallback(() => setWasOffline(false), []);

  return { isOnline, wasOffline, clearOfflineFlag };
}

/**
 * useDirtyForm — Hook reutilizable para rastrear cambios en formularios.
 *
 * T-1421: Expone isDirty y markClean para integrar con useUnsavedChanges.
 *
 * @param {object} initialValues — valores iniciales del formulario
 * @param {object} currentValues — valores actuales del formulario
 */
export function useDirtyForm(initialValues, currentValues) {
  const isDirty = JSON.stringify(initialValues) !== JSON.stringify(currentValues);
  return { isDirty };
}
