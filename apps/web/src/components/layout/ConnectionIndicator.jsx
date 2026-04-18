import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Tooltip } from "@/components/ui/Tooltip";

/**
 * ConnectionIndicator — Meridian Design System
 *
 * Punto de color en la TopBar que indica el estado de conexión.
 * Usa tokens semánticos Meridian y tooltip accesible.
 *
 * - EN LÍNEA: success (verde esmeralda) con pulso sutil
 * - SIN CONEXIÓN: warning (amber del sistema)
 */
export default function ConnectionIndicator() {
  const isOnline = useOnlineStatus();

  const dot = (
    <span
      role="status"
      aria-label={isOnline ? "Conectado" : "Sin conexión"}
      className="relative inline-flex items-center justify-center"
    >
      <span
        className={[
          "inline-block w-2 h-2 rounded-full transition-colors",
          isOnline ? "bg-success" : "bg-warning",
        ].join(" ")}
      />
      {/* Pulso sutil cuando está conectado */}
      {isOnline && (
        <span className="absolute inline-block w-2 h-2 rounded-full bg-success animate-ping opacity-40" />
      )}
    </span>
  );

  return (
    <Tooltip content={isOnline ? "Conectado" : "Sin conexión"}>
      {dot}
    </Tooltip>
  );
}
