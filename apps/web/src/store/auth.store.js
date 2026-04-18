import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/api/client";

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
      login: async ({ email, password, organizationId }) => {
        const res = await apiClient.post("/v1/auth/login", {
          email,
          password,
          organizationId,
        });
        const data = res.data.data ?? res.data;
        const { accessToken, refreshToken, user } = data;
        set({ accessToken, refreshToken: refreshToken ?? null, user, isAuthenticated: true });
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
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      /** Actualiza el access token tras un refresh exitoso */
      setToken: (accessToken) => set({ accessToken }),
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
