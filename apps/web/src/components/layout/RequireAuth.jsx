import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/auth.store";
import { apiClient } from "@/api/client";

/**
 * Guard de rutas privadas.
 * Redirige a /login si no hay sesión activa.
 */
export default function RequireAuth() {
  const { isAuthenticated, setUser, clearSession } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(isAuthenticated);

  useEffect(() => {
    let mounted = true;

    async function validateSession() {
      if (!isAuthenticated) {
        if (mounted) setCheckingSession(false);
        return;
      }

      try {
        const res = await apiClient.get("/v1/auth/me");
        const data = res.data?.data ?? res.data;
        if (!mounted) return;
        setUser(data ?? null);
      } catch {
        if (!mounted) return;
        clearSession();
        navigate("/login", { replace: true, state: { from: location } });
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    void validateSession();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, setUser, clearSession, navigate, location]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Outlet />;
}
