import { useOnlineStatus } from "@/modules/financial-operations/hooks/useFinOpsUx";

/**
 * OfflineBanner — Barra de advertencia cuando no hay conexión.
 *
 * T-1420: Se muestra en la parte superior de las páginas del módulo
 * cuando navigator.onLine es false.
 */
export default function OfflineBanner() {
  const { isOnline, wasOffline, clearOfflineFlag } = useOnlineStatus();

  if (isOnline && !wasOffline) return null;

  if (isOnline && wasOffline) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 flex items-center justify-between gap-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <p className="text-sm text-success font-medium">
            Conexión restaurada — Los datos se sincronizarán automáticamente
          </p>
        </div>
        <button
          onClick={clearOfflineFlag}
          className="text-xs text-success/70 hover:text-success font-medium"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-400/30 bg-amber-50 px-4 py-2.5 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      <p className="text-sm text-amber-800 font-medium">
        Sin conexión — Los cambios se guardarán localmente hasta recuperar la señal
      </p>
    </div>
  );
}
