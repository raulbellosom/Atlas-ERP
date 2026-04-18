/**
 * i18n base — AtlasERP Web.
 *
 * Decisión de fase: la app opera exclusivamente en español (es-AR / es).
 * No se incorpora librería externa (react-i18next, etc.) hasta que
 * se requiera soporte multi-idioma real.
 *
 * Uso:
 *   import { t } from "@/lib/i18n";
 *   t("common.save")  // → "Guardar"
 *
 * Para fechas y números usar los helpers de Intl directamente.
 */

const messages = {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    loading: "Cargando...",
    error: "Ocurrió un error",
    retry: "Reintentar",
    empty: "Sin resultados",
    confirm: "Confirmar",
    close: "Cerrar",
    back: "Volver",
  },
  auth: {
    login: "Ingresar",
    logout: "Cerrar sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    invalidCredentials: "Credenciales inválidas.",
    sessionExpired: "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.",
  },
  status: {
    active: "Activo",
    inactive: "Inactivo",
    locked: "Bloqueado",
    success: "Exitoso",
    error: "Error",
  },
  entity: {
    user: "Usuario",
    users: "Usuarios",
    role: "Rol",
    roles: "Roles",
    audit: "Auditoría",
    attachment: "Adjunto",
    attachments: "Adjuntos",
    settings: "Configuración",
    dashboard: "Dashboard",
  },
};

/**
 * Obtiene un texto por ruta de puntos ("common.save").
 * Retorna la ruta si no encuentra el texto (fail-visible).
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  const parts = key.split(".");
  let node = messages;
  for (const part of parts) {
    if (node == null || typeof node !== "object") return key;
    node = node[part];
  }
  return typeof node === "string" ? node : key;
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat("es", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const numberFormatter = new Intl.NumberFormat("es");

export const formatDate = (date) =>
  date ? dateFormatter.format(new Date(date)) : "—";

export const formatDateTime = (date) =>
  date ? dateTimeFormatter.format(new Date(date)) : "—";

export const formatNumber = (n) =>
  n != null ? numberFormatter.format(n) : "—";
