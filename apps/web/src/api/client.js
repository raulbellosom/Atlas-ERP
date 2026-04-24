import axios from 'axios';
import { env } from '@/config/env.js';

/**
 * Cliente HTTP base para el backend AtlasERP API.
 * - Request interceptor: inyecta Authorization header desde localStorage.
 * - Response interceptor: en 401 intenta refresh automático una vez;
 *   si falla limpia sesión y redirige a /login.
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// ─── Helpers para leer/escribir estado de auth en localStorage ───────────────

function readAuthState() {
  try {
    const raw = localStorage.getItem('atlas-auth');
    return raw ? (JSON.parse(raw)?.state ?? null) : null;
  } catch {
    return null;
  }
}

function writeAuthState(patch) {
  try {
    const raw = localStorage.getItem('atlas-auth');
    const stored = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    stored.state = { ...stored.state, ...patch };
    localStorage.setItem('atlas-auth', JSON.stringify(stored));
  } catch {
    // Ignorar
  }
}

function clearAuthState() {
  writeAuthState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
  delete apiClient.defaults.headers.common['Authorization'];
}

// ─── Request interceptor: adjuntar access token ──────────────────────────────

apiClient.interceptors.request.use((config) => {
  const state = readAuthState();
  const token = state?.accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: 401 → refresh → retry ────────────────────────────

// Flag para evitar bucle infinito si el refresh también falla con 401
let _isRefreshing = false;
// Cola de callbacks que esperan el nuevo token
let _refreshQueue = [];

function processQueue(error, token = null) {
  _refreshQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve(token)));
  _refreshQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Solo interceptar 401 en requests que no sean endpoints de auth propios
    // (login, refresh, logout) — si fallan, el componente debe manejar el error.
    const isAuthEndpoint = originalRequest?.url?.includes('/v1/auth/');

    if (status === 401 && !isAuthEndpoint && !originalRequest._retried) {
      originalRequest._retried = true;

      if (_isRefreshing) {
        // Otro request ya está refrescando — encolar y esperar
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      const state = readAuthState();
      const refreshToken = state?.refreshToken;

      if (!refreshToken) {
        clearAuthState();
        window.location.href = '/login';
        return Promise.reject(normalizeError(error));
      }

      _isRefreshing = true;

      try {
        const res = await apiClient.post('/v1/auth/refresh', { refreshToken });
        const data = res.data?.data ?? res.data;
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken;

        writeAuthState({
          accessToken: newAccessToken,
          ...(newRefreshToken && { refreshToken: newRefreshToken }),
        });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearAuthState();
        window.location.href = '/login';
        return Promise.reject(normalizeError(refreshError));
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

function normalizeError(error) {
  if (error instanceof Error && error._normalized) return error;
  const status = error?.response?.status;
  const code = error?.response?.data?.code ?? 'UNKNOWN';
  const message = error?.response?.data?.message ?? error?.message ?? 'Error desconocido';
  const normalized = new Error(message);
  normalized._normalized = true;
  normalized.status = status;
  normalized.code = code;
  normalized.response = { status, data: error?.response?.data ?? {} };
  normalized.raw = error;
  return normalized;
}
