/**
 * AtlasERP Web - Validacion de variables de entorno Vite al arranque.
 * Principio canon: fail fast.
 */

/** @type {Record<string, string>} */
const REQUIRED_ENV_VARS = {
  VITE_API_URL: 'URL base del backend API',
};

export function validateEnv() {
  const missing = Object.entries(REQUIRED_ENV_VARS)
    .filter(([key]) => !import.meta.env[key])
    .map(([key, description]) => `  - ${key}: ${description}`);

  if (missing.length > 0) {
    throw new Error(
      `[AtlasERP Web] Variables de entorno faltantes:\n${missing.join('\n')}\n\n` +
        'Copia .env.example a .env en la raiz del repositorio y completa los valores.',
    );
  }
}

export const env = {
  apiUrl: import.meta.env['VITE_API_URL'] ?? '',
  appName: import.meta.env['VITE_APP_NAME'] ?? 'AtlasERP',
  environment: import.meta.env['VITE_ENV'] ?? 'development',
};
