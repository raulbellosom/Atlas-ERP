/**
 * OfflineBlockedPage — pantalla completa para páginas no disponibles en modo offline.
 *
 * Uso: envolver el render de ReconciliationPage con este componente
 * cuando isOffline es true.
 *
 * Task origen: T-1514 (Fase 15 Bloque 3)
 */

/**
 * @param {{
 *   title?: string,
 *   message?: string,
 *   onRetry?: () => void,
 * }} props
 */
export function OfflineBlockedPage({
  title = "No disponible sin conexión",
  message = "Esta función requiere conexión a internet para operar en tiempo real.",
  onRetry,
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
      <p className="text-5xl">🔌</p>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reintentar al reconectar
        </button>
      )}
    </div>
  );
}
