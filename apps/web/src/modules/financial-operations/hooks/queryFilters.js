const EMPTY_FILTERS = Object.freeze({});

/**
 * Normaliza filtros para evitar llaves de query inestables.
 * - Elimina valores vacios (undefined, null, "")
 * - Ordena llaves alfabeticamente para serializacion determinista
 */
export function normalizeFilters(filters) {
  if (!filters || typeof filters !== "object") return EMPTY_FILTERS;

  const entries = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );

  if (entries.length === 0) return EMPTY_FILTERS;

  entries.sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}

/**
 * Genera un key serializable y estable para React Query.
 */
export function buildFiltersKey(filters) {
  return JSON.stringify(normalizeFilters(filters));
}

