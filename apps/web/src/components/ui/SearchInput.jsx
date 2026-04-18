/**
 * Input de busqueda con icono lupa y boton de limpiar.
 * Pensado para usarse con useGlobalSearch.
 *
 * Uso:
 *   const { query, setQuery, results } = useGlobalSearch(data, matcher);
 *   <SearchInput value={query} onChange={setQuery} placeholder="Buscar usuarios..." />
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
}) {
  return (
    <div className={["relative", className].join(" ")}>
      {/* Icono lupa */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-disabled">
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full pl-9 pr-4 py-2 text-sm rounded-md",
          "border border-border bg-surface text-text-primary",
          "placeholder:text-text-disabled",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
          "transition-colors",
        ].join(" ")}
      />

      {/* Boton limpiar */}
      {value && (
        <button
          type="button"
          aria-label="Limpiar busqueda"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary transition-colors"
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
