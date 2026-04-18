import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Banner que aparece en la parte superior cuando se pierde la conexion.
 * Se oculta automaticamente al recuperarla.
 */
export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full bg-yellow-400 text-yellow-900 text-sm font-medium text-center py-2 px-4 shrink-0"
    >
      Sin conexion — los cambios se guardarán localmente y se sincronizarán al reconectar.
    </div>
  );
}
