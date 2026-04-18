import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/auth.store";

/**
 * Guard para rutas que solo deben verse sin sesión activa (ej. /login).
 * Si ya está autenticado redirige al dashboard.
 */
export default function AlreadyAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
