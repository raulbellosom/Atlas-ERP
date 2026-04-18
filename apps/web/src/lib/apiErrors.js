/**
 * Utilidades para manejar errores de API de forma consistente en la UI.
 *
 * El backend retorna errores con la forma:
 *   { statusCode, message, error }
 * o Axios wrappea el error en `error.response.data`.
 */

/**
 * Extrae un mensaje de error legible de cualquier tipo de error:
 * - Error de Axios con respuesta del servidor
 * - Error de red (sin respuesta)
 * - Error generico de JS
 * - String directo
 *
 * @param {unknown} err
 * @param {string} [fallback]
 * @returns {string}
 */
export function getErrorMessage(err, fallback = "Ocurrió un error inesperado") {
  if (!err) return fallback;

  // Axios con respuesta del servidor
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(". ");
    if (typeof data.error === "string") return data.error;
  }

  // Error de red (sin respuesta)
  if (err?.request && !err?.response) {
    return "No se pudo conectar con el servidor. Verifica tu conexión.";
  }

  // Error JS estandar
  if (typeof err?.message === "string") return err.message;

  // String directo
  if (typeof err === "string") return err;

  return fallback;
}

/**
 * Extrae el código HTTP de un error de Axios.
 * @param {unknown} err
 * @returns {number | null}
 */
export function getStatusCode(err) {
  return err?.response?.status ?? null;
}

/**
 * Clasifica el error en una categoria semantica.
 * @param {unknown} err
 * @returns {"auth" | "forbidden" | "notFound" | "validation" | "server" | "network" | "unknown"}
 */
export function classifyError(err) {
  const status = getStatusCode(err);
  if (!status && err?.request) return "network";
  switch (status) {
    case 400: return "validation";
    case 401: return "auth";
    case 403: return "forbidden";
    case 404: return "notFound";
    default:
      if (status >= 500) return "server";
      if (status) return "unknown";
      return "unknown";
  }
}
