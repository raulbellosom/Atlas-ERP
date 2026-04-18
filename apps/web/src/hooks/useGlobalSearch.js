import { useState, useCallback, useRef } from "react";

/**
 * Hook de busqueda global local (client-side filter).
 * En fases posteriores se puede conectar a un endpoint de busqueda.
 *
 * @param {object[]} items — lista completa de elementos
 * @param {(item: object, query: string) => boolean} matcher — funcion que decide si un item coincide
 * @param {{ debounceMs?: number }} [options]
 * @returns {{ query, setQuery, results, isSearching }}
 */
export function useGlobalSearch(items, matcher, { debounceMs = 200 } = {}) {
  const [query, setQueryRaw] = useState("");
  const [results, setResults] = useState(items);
  const timerRef = useRef(null);

  const setQuery = useCallback(
    (value) => {
      setQueryRaw(value);

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const q = value.trim().toLowerCase();
        if (!q) {
          setResults(items);
        } else {
          setResults(items.filter((item) => matcher(item, q)));
        }
      }, debounceMs);
    },
    [items, matcher, debounceMs],
  );

  return {
    query,
    setQuery,
    results,
    isSearching: query.trim().length > 0,
  };
}
