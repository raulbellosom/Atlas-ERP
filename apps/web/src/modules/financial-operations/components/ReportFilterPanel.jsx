/**
 * ReportFilterPanel — panel de filtros reutilizable para reportes FinOps.
 *
 * Renders un formulario de filtros con los campos seleccionados via props.
 * Llama a onFilter(filters) al hacer submit o al cambiar un campo (si liveFilter=true).
 *
 * Características (T-1612):
 *   - Shortcuts de fecha: Este mes, Mes anterior, Trimestre actual, Año actual.
 *   - Badges de filtros activos con opción de remover individualmente.
 *   - Botón "Limpiar todo".
 *   - Persistencia en URL params (opt-in via persistToUrl=true).
 *
 * Campos disponibles:
 *   dateRange    — { from, to } — rango de fechas
 *   bankAccount  — select de cuentas bancarias
 *   bankAccounts — multi-select de cuentas bancarias
 *   movementType — multi-select (INCOME, EXPENSE, TRANSFER_IN, TRANSFER_OUT)
 *   status       — multi-select (PENDING, APPROVED, REJECTED)
 *   movementStatus — multi-select (DRAFT, POSTED, CANCELED, REVERSED)
 *   currency     — select (MXN, USD, EUR)
 *   counterparty — text input libre
 *
 * Task origen: T-1612 (Fase 16 Bloque 3)
 */

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEFAULT_MOVEMENT_TYPES = ["INCOME", "EXPENSE", "TRANSFER_IN", "TRANSFER_OUT"];
const DEFAULT_TRANSFER_STATUSES = ["PENDING", "APPROVED", "REJECTED"];
const DEFAULT_MOVEMENT_STATUSES = ["DRAFT", "POSTED", "CANCELED", "REVERSED"];

const TYPE_LABELS = {
  INCOME: "Ingreso",
  EXPENSE: "Egreso",
  TRANSFER_IN: "Entrada",
  TRANSFER_OUT: "Salida",
  ADJUSTMENT: "Ajuste",
};

const STATUS_LABELS_MAP = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  DRAFT: "Borrador",
  POSTED: "Contabilizado",
  CANCELED: "Cancelado",
  REVERSED: "Revertido",
};

// ─── Helpers de fecha (sin date-fns) ─────────────────────────────────────────

function toIso(d) {
  return d.toISOString().slice(0, 10);
}

function dateShortcuts() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-indexed

  const monthStart = (year, month) => new Date(year, month, 1);
  const monthEnd = (year, month) => new Date(year, month + 1, 0);
  const quarterStart = (year, q) => new Date(year, q * 3, 1);
  const quarterEnd = (year, q) => new Date(year, q * 3 + 3, 0);
  const currentQ = Math.floor(m / 3);

  return [
    {
      label: "Este mes",
      from: toIso(monthStart(y, m)),
      to: toIso(monthEnd(y, m)),
    },
    {
      label: "Mes anterior",
      from: toIso(m === 0 ? monthStart(y - 1, 11) : monthStart(y, m - 1)),
      to: toIso(m === 0 ? monthEnd(y - 1, 11) : monthEnd(y, m - 1)),
    },
    {
      label: "Trimestre actual",
      from: toIso(quarterStart(y, currentQ)),
      to: toIso(quarterEnd(y, currentQ)),
    },
    {
      label: "Año actual",
      from: toIso(new Date(y, 0, 1)),
      to: toIso(new Date(y, 11, 31)),
    },
  ];
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function DateInput({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-600">{label}{required && " *"}</label>
      <input
        type="date"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-meridian-500"
      />
    </div>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-meridian-500"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

function MultiCheckbox({ label, options, selected, onChange }) {
  function toggle(val) {
    onChange(
      selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val],
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-ink-600">{label}</label>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((o) => {
          const val = o.value ?? o;
          const lbl = o.label ?? o;
          const active = selected.includes(val);
          return (
            <button
              key={val}
              type="button"
              onClick={() => toggle(val)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-meridian-600 text-white"
                  : "border border-ink-200 text-ink-600 hover:border-meridian-400"
              }`}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Badges de filtros activos ────────────────────────────────────────────────

function ActiveFilterBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-meridian-50 border border-meridian-200 px-2.5 py-0.5 text-xs font-medium text-meridian-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="ml-0.5 text-meridian-400 hover:text-meridian-700 transition-colors"
      >
        ×
      </button>
    </span>
  );
}

// ─── Hook para URL params (opt-in) ───────────────────────────────────────────

function useFilterUrlParams(enabled) {
  const [searchParams, setSearchParams] = useSearchParams();

  const readParam = (key, fallback = "") => searchParams.get(key) ?? fallback;
  const readArrayParam = (key) => {
    const v = searchParams.get(key);
    return v ? v.split(",") : [];
  };

  const writeParams = useCallback((updates) => {
    if (!enabled) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
          next.delete(k);
        } else {
          next.set(k, Array.isArray(v) ? v.join(",") : v);
        }
      }
      return next;
    }, { replace: true });
  }, [enabled, setSearchParams]);

  return {
    readParam,
    readArrayParam,
    writeParams,
    paramsSnapshot: searchParams.toString(),
  };
}

// ─── Panel principal ──────────────────────────────────────────────────────────

/**
 * @param {{
 *   fields?: string[],
 *   bankAccounts?: Array<{id:string, name:string}>,
 *   onFilter: (filters: object) => void,
 *   liveFilter?: boolean,
 *   loading?: boolean,
 *   persistToUrl?: boolean,
 * }} props
 */
export function ReportFilterPanel({
  fields = ["dateRange"],
  bankAccounts = [],
  onFilter,
  liveFilter = false,
  loading = false,
  persistToUrl = false,
}) {
  const { readParam, readArrayParam, writeParams, paramsSnapshot } = useFilterUrlParams(persistToUrl);

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + "01";
  const shortcuts = dateShortcuts();

  const [from, setFromState] = useState(readParam("from", firstOfMonth));
  const [to, setToState] = useState(readParam("to", today));
  const [bankAccountId, setBankAccountIdState] = useState(readParam("bankAccountId", ""));
  const [bankAccountIds, setBankAccountIdsState] = useState(readArrayParam("bankAccountIds"));
  const [movementTypes, setMovementTypesState] = useState(() => {
    const fromUrl = readArrayParam("types");
    return fromUrl.length > 0 ? fromUrl : DEFAULT_MOVEMENT_TYPES;
  });
  const [statuses, setStatusesState] = useState(readArrayParam("statuses"));
  const [currency, setCurrencyState] = useState(readParam("currency", ""));
  const [counterparty, setCounterpartyState] = useState(readParam("counterparty", ""));
  const [activeShortcut, setActiveShortcut] = useState(null);

  useEffect(() => {
    if (!persistToUrl) return;
    const params = new URLSearchParams(paramsSnapshot);
    const getParam = (key, fallback = "") => params.get(key) ?? fallback;
    const getArrayParam = (key) => {
      const value = params.get(key);
      return value ? value.split(",") : [];
    };

    setFromState(getParam("from", firstOfMonth));
    setToState(getParam("to", today));
    setBankAccountIdState(getParam("bankAccountId", ""));
    setBankAccountIdsState(getArrayParam("bankAccountIds"));
    setMovementTypesState(() => {
      const fromUrl = getArrayParam("types");
      return fromUrl.length > 0 ? fromUrl : DEFAULT_MOVEMENT_TYPES;
    });
    setStatusesState(getArrayParam("statuses"));
    setCurrencyState(getParam("currency", ""));
    setCounterpartyState(getParam("counterparty", ""));
    setActiveShortcut(null);
  }, [persistToUrl, paramsSnapshot, firstOfMonth, today]);

  // Wrappers que también escriben a URL params
  const setFrom = (v) => { setFromState(v); setActiveShortcut(null); writeParams({ from: v }); };
  const setTo = (v) => { setToState(v); setActiveShortcut(null); writeParams({ to: v }); };
  const setBankAccountId = (v) => { setBankAccountIdState(v); writeParams({ bankAccountId: v }); };
  const setBankAccountIds = (v) => { setBankAccountIdsState(v); writeParams({ bankAccountIds: v }); };
  const setMovementTypes = (v) => { setMovementTypesState(v); writeParams({ types: v }); };
  const setStatuses = (v) => { setStatusesState(v); writeParams({ statuses: v }); };
  const setCurrency = (v) => { setCurrencyState(v); writeParams({ currency: v }); };
  const setCounterparty = (v) => { setCounterpartyState(v); writeParams({ counterparty: v }); };

  function applyShortcut(s) {
    setFromState(s.from);
    setToState(s.to);
    setActiveShortcut(s.label);
    writeParams({ from: s.from, to: s.to });
  }

  function buildFilters() {
    return {
      from: fields.includes("dateRange") ? from : undefined,
      to: fields.includes("dateRange") ? to : undefined,
      bankAccountId: fields.includes("bankAccount") ? bankAccountId || undefined : undefined,
      bankAccountIds: fields.includes("bankAccounts") ? bankAccountIds : undefined,
      types: fields.includes("movementType") ? movementTypes : undefined,
      statuses: fields.includes("status") && statuses.length > 0 ? statuses : undefined,
      currency: fields.includes("currency") ? currency || undefined : undefined,
      counterparty: fields.includes("counterparty") ? counterparty || undefined : undefined,
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    onFilter(buildFilters());
  }

  function clearAll() {
    setFromState(firstOfMonth);
    setToState(today);
    setBankAccountIdState("");
    setBankAccountIdsState([]);
    setMovementTypesState(DEFAULT_MOVEMENT_TYPES);
    setStatusesState([]);
    setCurrencyState("");
    setCounterpartyState("");
    setActiveShortcut(null);
    writeParams({ from: null, to: null, bankAccountId: null, bankAccountIds: null,
      types: null, statuses: null, currency: null, counterparty: null });
    onFilter({});
  }

  // ── Calcular badges activos ──
  const activeBadges = [];
  if (fields.includes("dateRange") && (from !== firstOfMonth || to !== today)) {
    activeBadges.push({
      key: "dateRange",
      label: activeShortcut ?? `${from} — ${to}`,
      onRemove: () => { setFrom(firstOfMonth); setTo(today); },
    });
  }
  if (fields.includes("bankAccount") && bankAccountId) {
    const acc = bankAccounts.find((a) => a.id === bankAccountId);
    activeBadges.push({
      key: "bankAccount",
      label: `Cuenta: ${acc?.name ?? bankAccountId}`,
      onRemove: () => setBankAccountId(""),
    });
  }
  if (fields.includes("movementType") && movementTypes.length < DEFAULT_MOVEMENT_TYPES.length) {
    activeBadges.push({
      key: "types",
      label: `Tipos: ${movementTypes.map((t) => TYPE_LABELS[t] ?? t).join(", ")}`,
      onRemove: () => setMovementTypes(DEFAULT_MOVEMENT_TYPES),
    });
  }
  if ((fields.includes("status") || fields.includes("movementStatus")) && statuses.length > 0) {
    activeBadges.push({
      key: "statuses",
      label: `Estatus: ${statuses.map((s) => STATUS_LABELS_MAP[s] ?? s).join(", ")}`,
      onRemove: () => setStatuses([]),
    });
  }
  if (fields.includes("currency") && currency) {
    activeBadges.push({
      key: "currency",
      label: `Moneda: ${currency}`,
      onRemove: () => setCurrency(""),
    });
  }
  if (fields.includes("counterparty") && counterparty) {
    activeBadges.push({
      key: "counterparty",
      label: `Contraparte: ${counterparty}`,
      onRemove: () => setCounterparty(""),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Shortcuts de fecha */}
      {fields.includes("dateRange") && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-ink-400 mr-1">Período:</span>
          {shortcuts.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => applyShortcut(s)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                activeShortcut === s.label
                  ? "bg-meridian-600 text-white"
                  : "border border-ink-200 text-ink-600 hover:border-meridian-400 hover:text-meridian-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Campos del formulario */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {fields.includes("dateRange") && (
          <>
            <DateInput label="Desde" value={from} onChange={setFrom} required />
            <DateInput label="Hasta" value={to} onChange={setTo} required />
          </>
        )}

        {fields.includes("bankAccount") && (
          <SelectInput
            label="Cuenta bancaria"
            value={bankAccountId}
            onChange={setBankAccountId}
            options={bankAccounts.map((a) => ({ value: a.id, label: a.name }))}
          />
        )}

        {fields.includes("bankAccounts") && (
          <MultiCheckbox
            label="Cuentas"
            options={bankAccounts.map((a) => ({ value: a.id, label: a.name }))}
            selected={bankAccountIds}
            onChange={setBankAccountIds}
          />
        )}

        {fields.includes("movementType") && (
          <MultiCheckbox
            label="Tipo de movimiento"
            options={DEFAULT_MOVEMENT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] ?? t }))}
            selected={movementTypes}
            onChange={setMovementTypes}
          />
        )}

        {fields.includes("status") && (
          <MultiCheckbox
            label="Estatus"
            options={DEFAULT_TRANSFER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS_MAP[s] ?? s }))}
            selected={statuses}
            onChange={setStatuses}
          />
        )}

        {fields.includes("movementStatus") && (
          <MultiCheckbox
            label="Estatus"
            options={DEFAULT_MOVEMENT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS_MAP[s] ?? s }))}
            selected={statuses}
            onChange={setStatuses}
          />
        )}

        {fields.includes("currency") && (
          <SelectInput
            label="Moneda"
            value={currency}
            onChange={setCurrency}
            options={["MXN", "USD", "EUR"]}
          />
        )}

        {fields.includes("counterparty") && (
          <div>
            <label className="block text-xs font-medium text-ink-600">Contraparte</label>
            <input
              type="text"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="Nombre o RFC…"
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-meridian-500"
            />
          </div>
        )}
      </div>

      {/* Badges de filtros activos */}
      {activeBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-ink-400 mr-1">Activos:</span>
          {activeBadges.map((b) => (
            <ActiveFilterBadge key={b.key} label={b.label} onRemove={b.onRemove} />
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-medium text-ink-400 hover:text-error ml-1 transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {!liveFilter && (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-meridian-600 px-5 py-2 text-sm font-semibold text-white hover:bg-meridian-700 disabled:opacity-50"
          >
            {loading ? "Buscando…" : "Aplicar filtros"}
          </button>
        </div>
      )}
    </form>
  );
}
