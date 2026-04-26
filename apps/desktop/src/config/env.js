/**
 * AtlasERP Desktop — Validacion de variables de entorno Vite al arranque.
 * Similar a apps/web pero incluye variables especificas de desktop.
 * Referencia: docs/02-architecture/10-estrategia-environment-variables.md
 */

/** @type {Record<string, string>} */
const REQUIRED_ENV_VARS = {
  VITE_API_URL: 'URL base del backend API',
};

const runtimeEnv = (() => {
  if (
    typeof import.meta !== 'undefined' &&
    import.meta &&
    typeof import.meta.env === 'object' &&
    import.meta.env !== null
  ) {
    return import.meta.env;
  }
  if (typeof process !== 'undefined' && process?.env) {
    return process.env;
  }
  return {};
})();

/**
 * Valida variables de entorno obligatorias.
 * El desktop puede funcionar offline, pero necesita la URL del backend
 * para sincronizar cuando recupera conexion.
 */
export function validateEnv() {
  const missing = Object.entries(REQUIRED_ENV_VARS)
    .filter(([key]) => !runtimeEnv[key])
    .map(([key, description]) => `  - ${key}: ${description}`);

  if (missing.length > 0) {
    throw new Error(
      `[AtlasERP Desktop] Variables de entorno faltantes:\n${missing.join('\n')}\n\n` +
        'Copia .env.example a .env en la raiz del repositorio y completa los valores.',
    );
  }
}

/**
 * Variables de entorno validadas para el desktop.
 */
export const env = {
  apiUrl: runtimeEnv['VITE_API_URL'] ?? '',
  appName: runtimeEnv['VITE_APP_NAME'] ?? 'AtlasERP',
  environment: runtimeEnv['VITE_ENV'] ?? 'development',
  dataDir: runtimeEnv['VITE_DESKTOP_DATA_DIR'] ?? runtimeEnv['DESKTOP_DATA_DIR'] ?? '',
};
