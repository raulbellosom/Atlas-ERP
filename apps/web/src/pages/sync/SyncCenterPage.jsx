import { useSyncStatus } from "@/hooks/useSyncStatus";
import { formatDateTime } from "@/lib/i18n";

/**
 * Shell del centro de sincronizacion.
 * Muestra el estado actual de conectividad y operaciones pendientes.
 * El mecanismo de sync real se implementa en la fase de modulo offline.
 */
export default function SyncCenterPage() {
  const { isOnline, pendingCount, lastSyncAt, hasPending, clearPending } =
    useSyncStatus();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">
        Centro de sincronización
      </h1>

      {/* Estado de conexion */}
      <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Conexión
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={[
              "inline-block w-3 h-3 rounded-full",
              isOnline ? "bg-green-500" : "bg-yellow-400",
            ].join(" ")}
          />
          <span className="text-base font-medium text-text-primary">
            {isOnline ? "En línea" : "Sin conexión"}
          </span>
        </div>
      </div>

      {/* Pendientes */}
      <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Cambios pendientes
        </h2>

        {hasPending ? (
          <div className="flex items-center justify-between">
            <span className="text-base text-text-primary">
              {pendingCount} operación{pendingCount !== 1 ? "es" : ""} sin
              sincronizar
            </span>
            <button
              onClick={clearPending}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              Marcar como sincronizadas
            </button>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            Todo sincronizado. No hay cambios pendientes.
          </p>
        )}
      </div>

      {/* Ultima sincronizacion */}
      {lastSyncAt && (
        <p className="text-xs text-text-disabled text-center">
          Última sincronización: {formatDateTime(lastSyncAt)}
        </p>
      )}
    </div>
  );
}
