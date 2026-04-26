import { useState, useCallback, useRef, useEffect, useMemo } from "react";

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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) {
      return items;
    }

    return items.filter((item) => matcher(item, q));
  }, [items, matcher, debouncedQuery]);

  const setQuery = useCallback(
    (value) => {
      setQueryRaw(value);

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setDebouncedQuery(value);
      }, debounceMs);
    },
    [debounceMs],
  );

  return {
    query,
    setQuery,
    results,
    isSearching: query.trim().length > 0,
  };
}
