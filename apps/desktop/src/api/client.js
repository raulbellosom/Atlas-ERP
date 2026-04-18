/**
 * Cliente HTTP mínimo para AtlasERP Desktop.
 *
 * Usa fetch nativo + la URL del backend configurada en env.
 * Adjunta el accessToken del almacenamiento seguro cuando está disponible.
 *
 * Task origen: T-1503 (Fase 15 Bloque 1)
 */

import { env } from "../config/env.js";

function getStoredToken() {
  try {
    return sessionStorage.getItem("atlas_access_token") ?? localStorage.getItem("atlas_access_token") ?? null;
  } catch {
    return null;
  }
}

function buildUrl(path, params) {
  const base = env.apiUrl.replace(/\/$/, "");
  const url = new URL(`${base}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function request(method, path, { params, body } = {}) {
  const url = buildUrl(path, params);
  const token = getStoredToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`[DesktopAPI] ${method} ${path} → ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export const desktopApiClient = {
  get: (path, options) => request("GET", path, options),
  post: (path, body, options) => request("POST", path, { ...options, body }),
  patch: (path, body, options) => request("PATCH", path, { ...options, body }),
  put: (path, body, options) => request("PUT", path, { ...options, body }),
  delete: (path, options) => request("DELETE", path, options),
};
