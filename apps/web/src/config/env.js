/**
 * AtlasERP Web — Validacion de variables de entorno Vite al arranque.
 * Principio canon: "fail fast" — la app muestra error critico si falta configuracion.
 * Referencia: docs/02-architecture/10-estrategia-environment-variables.md
 *
 * Usar al inicializar la app (importado desde main.jsx antes de montar React).
 */

/** @type {Record<string, string>} */
const REQUIRED_ENV_VARS = {
  VITE_API_URL: 'URL base del backend API',
};

/**
 * Valida que todas las variables VITE_ obligatorias esten definidas.
 * Lanza un error con lista de variables faltantes si no.
 */
export function validateEnv() {
  const missing = Object.entries(REQUIRED_ENV_VARS)
    .filter(([key]) => !import.meta.env[key])
    .map(([key, description]) => `  - ${key}: ${description}`);

  if (missing.length > 0) {
    throw new Error(
      `[AtlasERP Web] Variables de entorno faltantes:\n${missing.join('\n')}\n\n` +
        'Copia apps/web/.env.example a apps/web/.env y completa los valores.',
    );
  }
}

/**
 * Variables de entorno validadas y tipadas.
 * Usar este objeto en lugar de import.meta.env directamente.
 */
export const env = {
  apiUrl: import.meta.env['VITE_API_URL'] ?? '',
  appName: import.meta.env['VITE_APP_NAME'] ?? 'AtlasERP',
  environment: import.meta.env['VITE_ENV'] ?? 'development',
  /** ID de organización por defecto (requerido en dev single-tenant) */
  defaultOrgId: import.meta.env['VITE_DEFAULT_ORG_ID'] ?? '',
};
