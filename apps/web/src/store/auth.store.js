import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/api/client";

function persistAuthNow(state) {
  try {
    localStorage.setItem(
      "atlas-auth",
      JSON.stringify({
        state,
        version: 0,
      }),
    );
  } catch {
    // ignore
  }
}

/**
 * Estado global de autenticación.
 * Persiste accessToken, refreshToken y datos del usuario en localStorage.
 *
 * NOTA DE SEGURIDAD: almacenar refresh tokens en localStorage es aceptable
 * para esta fase. En producción evaluar httpOnly cookies si el deployment lo permite.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      /** Login: llama a la API y guarda ambos tokens */
      login: async ({ email, password, organizationId = undefined }) => {
        const payload = {
          email,
          password,
          ...(organizationId ? { organizationId } : {}),
        };
        const res = await apiClient.post("/v1/auth/login", payload);
        const data = res.data.data ?? res.data;
        const { accessToken, refreshToken, user } = data;
        const nextState = {
          accessToken,
          refreshToken: refreshToken ?? null,
          user,
          isAuthenticated: true,
        };
        set(nextState);
        persistAuthNow(nextState);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        return { accessToken, user };
      },

      /** Logout: limpia estado local y notifica al backend */
      logout: () => {
        const token = get().accessToken;
        if (token) {
          apiClient
            .post("/v1/auth/logout", { allSessions: false })
            .catch(() => {});
        }
        get().clearSession();
        delete apiClient.defaults.headers.common["Authorization"];
      },

      /** Actualiza el access token tras un refresh exitoso */
      setToken: (accessToken) => {
        set({ accessToken });
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      },

      /** Sincroniza datos de usuario tras validar sesión */
      setUser: (user) => {
        const nextState = {
          ...get(),
          user,
          isAuthenticated: Boolean(user && get().accessToken),
        };
        set({
          user: nextState.user,
          isAuthenticated: nextState.isAuthenticated,
        });
        persistAuthNow({
          user: nextState.user,
          accessToken: get().accessToken,
          refreshToken: get().refreshToken,
          isAuthenticated: nextState.isAuthenticated,
        });
      },

      /** Limpia sesión local sin llamar backend (caso token inválido/stale) */
      clearSession: () => {
        const nextState = {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        };
        set(nextState);
        persistAuthNow(nextState);
        delete apiClient.defaults.headers.common["Authorization"];
      },
    }),
    {
      name: "atlas-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
