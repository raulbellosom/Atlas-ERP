import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "@/store/auth.store";

/**
 * Guard de rutas privadas.
 * Redirige a /login si no hay sesión activa.
 */
export default function RequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
