import { useState, useCallback, useRef } from "react";
import { TableRowSkeleton } from "./Skeleton";

/* ── Indicador de ordenamiento ──────────────────────────────────────────────── */
function SortIcon({ active, direction }) {
  return (
    <span className="inline-flex flex-col gap-0.5 ml-1.5 shrink-0" aria-hidden="true">
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
        <path
          d="M4 0.5L7.5 4H0.5L4 0.5Z"
          fill={
            active && direction === "asc"
              ? "var(--color-amber-500)"
              : "var(--color-neutral-300)"
          }
          style={{ transition: "fill 120ms ease" }}
        />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
        <path
          d="M4 4.5L0.5 1H7.5L4 4.5Z"
          fill={
            active && direction === "desc"
              ? "var(--color-amber-500)"
              : "var(--color-neutral-300)"
          }
          style={{ transition: "fill 120ms ease" }}
        />
      </svg>
    </span>
  );
}

/* ── Empty state moderno ────────────────────────────────────────────────────── */
function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      {/* Icono abstracto de tabla vacía */}
      <div className="w-14 h-14 rounded-2xl bg-ink-50 flex items-center justify-center">
        <svg
          width="28" height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-ink-300)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 9v12" />
        </svg>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

/* ── Checkbox accesible ─────────────────────────────────────────────────────── */
function TableCheckbox({ checked, indeterminate, onChange, ariaLabel }) {
  return (
    <label className="flex items-center justify-center cursor-pointer group">
      <input
        ref={(el) => { if (el) el.indeterminate = Boolean(indeterminate); }}
        type="checkbox"
        className="sr-only"
        checked={Boolean(checked)}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <span
        aria-hidden="true"
        className={[
          "w-4 h-4 rounded-md border flex items-center justify-center shrink-0",
          "transition-all duration-100",
          checked || indeterminate
            ? "bg-ink-600 border-ink-600 shadow-[0_0_0_3px_oklch(44.5%_0.138_245/0.15)]"
            : "bg-surface border-border group-hover:border-border-strong",
        ].join(" ")}
      >
        {checked && !indeterminate && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {indeterminate && (
          <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
            <path d="M1 1H7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </label>
  );
}

/* ── Tabla principal ────────────────────────────────────────────────────────── */
/**
 * Table — Meridian v2 Design System
 *
 * Tabla de datos con ordenamiento, selección, cabecera sticky y empty state.
 * Hover con acento izquierdo amber. Header con fondo sutil diferenciado.
 *
 * @param {{
 *   columns: Array<{
 *     key: string,
 *     header: string,
 *     sortable?: boolean,
 *     align?: 'left'|'center'|'right',
 *     width?: string,
 *     sortValue?: (row: object) => any,
 *     render?: (row: object) => React.ReactNode,
 *   }>,
 *   data?: object[],
 *   isLoading?: boolean,
 *   emptyTitle?: string,
 *   emptyDescription?: string,
 *   emptyAction?: React.ReactNode,
 *   keyField?: string,
 *   onRowClick?: (row: object) => void,
 *   selectable?: boolean,
 *   selectedKeys?: (string|number)[],
 *   onSelectionChange?: (keys: (string|number)[]) => void,
 *   stickyHeader?: boolean,
 *   striped?: boolean,
 *   compact?: boolean,
 *   className?: string,
 * }} props
 */
export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = "Sin registros",
  emptyDescription = "No hay datos que mostrar en esta sección.",
  emptyAction,
  keyField = "id",
  onRowClick,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  stickyHeader = false,
  striped = false,
  compact = false,
  className = "",
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = useCallback(
    (col) => {
      if (!col.sortable) return;
      if (sortKey === col.key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(col.key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const sortedData = [...data];
  if (sortKey) {
    const col = columns.find((c) => c.key === sortKey);
    sortedData.sort((a, b) => {
      const aVal = col?.sortValue ? col.sortValue(a) : a[sortKey];
      const bVal = col?.sortValue ? col.sortValue(b) : b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  const allSelected = data.length > 0 && selectedKeys.length === data.length;
  const someSelected = selectedKeys.length > 0 && !allSelected;

  const toggleAll = () =>
    onSelectionChange?.(allSelected ? [] : data.map((r) => r[keyField]));

  const toggleRow = (key) =>
    selectedKeys.includes(key)
      ? onSelectionChange?.(selectedKeys.filter((k) => k !== key))
      : onSelectionChange?.([...selectedKeys, key]);

  const colCount = columns.length + (selectable ? 1 : 0);
  const cellPy = compact ? "py-2.5" : "py-3.5";

  return (
    <div
      className={[
        "w-full overflow-x-auto rounded-xl border border-border bg-surface",
        "[box-shadow:var(--shadow-sm)]",
        className,
      ].join(" ")}
    >
      <table className="w-full text-sm border-collapse">
        {/* ── THEAD ── */}
        <thead className={stickyHeader ? "sticky top-0 z-10" : ""}>
          <tr className="border-b border-border">
            {selectable && (
              <th className="w-11 px-4 py-3 bg-surface-subtle">
                <TableCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  ariaLabel="Seleccionar todos"
                />
              </th>
            )}
            {columns.map((col) => {
              const isActive = sortKey === col.key;
              const alignClass = {
                left:   "text-left",
                center: "text-center",
                right:  "text-right",
              }[col.align ?? "left"] ?? "text-left";

              return (
                <th
                  key={col.key}
                  className={[
                    "px-4 py-3 bg-surface-subtle",
                    "text-[0.6875rem] font-semibold tracking-wider uppercase",
                    isActive ? "text-ink-700" : "text-text-secondary",
                    col.sortable
                      ? "cursor-pointer select-none hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)] rounded-sm"
                      : "",
                    alignClass,
                    "whitespace-nowrap transition-colors duration-100",
                  ].join(" ")}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col)}
                  tabIndex={col.sortable ? 0 : undefined}
                  onKeyDown={(e) => e.key === "Enter" && col.sortable && handleSort(col)}
                  aria-sort={
                    isActive
                      ? sortDir === "asc" ? "ascending" : "descending"
                      : undefined
                  }
                >
                  <span className="inline-flex items-center">
                    {col.header}
                    {col.sortable && (
                      <SortIcon active={isActive} direction={sortDir} />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* ── TBODY ── */}
        <tbody>
          {isLoading ? (
            <TableRowSkeleton cols={colCount} rows={5} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colCount}>
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => {
              const key = row[keyField];
              const isSelected = selectedKeys.includes(key);
              const isClickable = Boolean(onRowClick);
              const isStriped = striped && idx % 2 === 1;

              return (
                <tr
                  key={key}
                  onClick={isClickable ? () => onRowClick(row) : undefined}
                  className={[
                    "border-b border-border last:border-0",
                    "transition-colors duration-100",
                    /* Acento izquierdo en hover/selección */
                    "relative",
                    isSelected
                      ? "bg-ink-50 shadow-[inset_3px_0_0_var(--color-ink-500)]"
                      : isStriped
                      ? "bg-neutral-50/60 hover:bg-ink-50/40 hover:shadow-[inset_3px_0_0_var(--color-ink-200)]"
                      : "hover:bg-ink-50/40 hover:shadow-[inset_3px_0_0_var(--color-ink-200)]",
                    isClickable ? "cursor-pointer" : "",
                  ].join(" ")}
                >
                  {selectable && (
                    <td
                      className={`w-11 px-4 ${cellPy}`}
                      onClick={(e) => { e.stopPropagation(); toggleRow(key); }}
                    >
                      <TableCheckbox
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        ariaLabel={`Seleccionar fila ${key}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const alignClass = {
                      left:   "text-left",
                      center: "text-center",
                      right:  "text-right",
                    }[col.align ?? "left"] ?? "text-left";

                    return (
                      <td
                        key={col.key}
                        className={[`px-4 ${cellPy} text-text-primary`, alignClass].join(" ")}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
