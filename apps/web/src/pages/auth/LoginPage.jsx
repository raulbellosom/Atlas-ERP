import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "@/store/auth.store";
import { env } from "@/config/env.js";

/**
 * Página de login.
 * Requiere VITE_DEFAULT_ORG_ID en desarrollo o selección de org en producción.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname ?? "/dashboard";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const organizationId = env.defaultOrgId;
      if (!organizationId) {
        throw { message: "VITE_DEFAULT_ORG_ID no está configurada." };
      }
      await login({ ...form, organizationId });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message ?? "Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-surface rounded-xl shadow-sm border border-border p-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-text-primary">AtlasERP</h1>
          <p className="text-sm text-text-secondary mt-1">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="usuario@empresa.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
