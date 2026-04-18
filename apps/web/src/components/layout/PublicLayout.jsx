import { Outlet } from "react-router-dom";

/**
 * Layout para rutas públicas (login, recuperación de contraseña).
 * Centrado vertical y horizontal, fondo neutro.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
      <Outlet />
    </div>
  );
}
