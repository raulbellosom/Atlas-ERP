/**
 * MovementsReportPage — Reporte de movimientos financieros por rango de fechas.
 *
 * Genera en el cliente un reporte filtrable con totales por tipo y moneda.
 * Exporta a CSV (nativo), XLSX (exceljs — T-1608) y PDF (@react-pdf/renderer — T-1609).
 *
 * Task origen: T-1601 (Fase 16 Bloque 1)
 * Arquitectura: 16-catalogo-reportes-finops-v1.md
 */

import { useEffect, useState, useMemo } from "react";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { useMovementsByFilters } from "@/modules/financial-operations/hooks/useMovements";
import { useBankAccounts } from "@/modules/financial-operations/hooks/useBankAccounts";
import { ReportFilterPanel } from "@/modules/financial-operations/components/ReportFilterPanel";
import { exportToCsv, movementsColumns } from "@/modules/financial-operations/utils/exportCsv";
import { exportToXlsx, movementsSheet, totalsByTypeSheet } from "@/modules/financial-operations/utils/exportXlsx";
import { exportToPdf, movementsPdfColumns } from "@/modules/financial-operations/utils/exportPdf";
import { useReportAudit } from "@/modules/financial-operations/hooks/useReportAudit";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

// ─── Constantes de presentación ───────────────────────────────────────────────

const ROW_LIMIT = 5_000;

const TYPE_LABELS = {
  INCOME:       "Ingreso",
  EXPENSE:      "Egreso",
  ADJUSTMENT:   "Ajuste",
  TRANSFER_IN:  "Transferencia entrada",
  TRANSFER_OUT: "Transferencia salida",
};

const TYPE_VARIANTS = {
  INCOME:       "success",
  EXPENSE:      "error",
  ADJUSTMENT:   "info",
  TRANSFER_IN:  "success",
  TRANSFER_OUT: "error",
};

const STATUS_LABELS = {
  DRAFT:     "Borrador",
  POSTED:    "Contabilizado",
  CANCELED:  "Cancelado",
  REVERSED:  "Revertido",
};

const STATUS_VARIANTS = {
  DRAFT:     "warning",
  POSTED:    "primary",
  CANCELED:  "neutral",
  REVERSED:  "neutral",
};

const INCOME_TYPES = new Set(["INCOME", "TRANSFER_IN"]);

// ─── Utilidades ──────────────────────────────────────────────────────────────

function formatMoney(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount ?? "0"));
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}


// ─── Computar totales ─────────────────────────────────────────────────────────

function computeTotals(movements) {
  const byType = {};
  const byCurrency = {};

  for (const m of movements) {
    const type = m.movementType ?? "UNKNOWN";
    const currency = m.currencyCode ?? "MXN";
    const amount = parseFloat(m.amount ?? "0");

    byType[type] = (byType[type] ?? 0) + amount;
    byCurrency[currency] = (byCurrency[currency] ?? 0) + (INCOME_TYPES.has(type) ? amount : -amount);
  }

  return { byType, byCurrency };
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function LimitWarning() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>
        <strong>Más de {ROW_LIMIT.toLocaleString("es-MX")} registros.</strong>{" "}
        Refina el filtro para mejor rendimiento y exactitud en los totales.
      </span>
    </div>
  );
}

function TotalsSection({ movements }) {
  const { byType, byCurrency } = useMemo(() => computeTotals(movements), [movements]);

  return (
    <div className="rounded-xl border border-ink-200 bg-surface-50 p-4 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Totales</h3>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {["INCOME", "EXPENSE", "TRANSFER_IN", "TRANSFER_OUT", "ADJUSTMENT"].map((type) => (
          <div key={type}>
            <span className="block text-[10px] font-medium text-ink-400 uppercase tracking-wide mb-0.5">
              {TYPE_LABELS[type] ?? type}
            </span>
            <span className="text-sm font-mono font-semibold text-ink-900">
              {formatMoney(byType[type] ?? 0)}
            </span>
          </div>
        ))}
      </div>

      {Object.keys(byCurrency).length > 0 && (
        <div className="pt-3 border-t border-ink-100">
          <span className="block text-[10px] font-medium text-ink-400 uppercase tracking-wide mb-2">
            Neto por moneda
          </span>
          <div className="flex flex-wrap gap-4">
            {Object.entries(byCurrency).map(([currency, net]) => (
              <div key={currency} className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium text-ink-500">{currency}</span>
                <span className={`font-mono text-sm font-semibold ${net >= 0 ? "text-success" : "text-error"}`}>
                  {formatMoney(net, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasFiltered }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-surface-subtle p-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-300">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
      </div>
      <p className="text-sm font-medium text-ink-700">
        {hasFiltered ? "Sin movimientos en el periodo seleccionado" : "Aplica los filtros para generar el reporte"}
      </p>
      <p className="mt-1 text-xs text-ink-400">
        {hasFiltered
          ? "Prueba ampliando el rango de fechas o cambiando los filtros."
          : "Selecciona el rango de fechas y haz clic en Aplicar filtros."}
      </p>
    </div>
  );
}

function ExportButtons({ onCsv, onXlsx, onPdf, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onCsv}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-subtle disabled:opacity-40 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        CSV
      </button>
      <button
        type="button"
        onClick={onXlsx}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-subtle disabled:opacity-40 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        XLSX
      </button>
      <button
        type="button"
        onClick={onPdf}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-subtle disabled:opacity-40 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        PDF
      </button>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MovementsReportPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { logExport } = useReportAudit();

  const [activeFilters, setActiveFilters] = useState(null);
  const [hasFiltered, setHasFiltered] = useState(false);

  const { data: bankAccounts = [] } = useBankAccounts(organizationId);

  const bankAccountsById = useMemo(
    () => Object.fromEntries(bankAccounts.map((a) => [a.id, a])),
    [bankAccounts],
  );

  const {
    data: movements = [],
    isLoading,
    error,
  } = useMovementsByFilters(organizationId, activeFilters ?? {}, Boolean(activeFilters));

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const overLimit = movements.length > ROW_LIMIT;
  const displayRows = overLimit ? movements.slice(0, ROW_LIMIT) : movements;

  // ── Handlers de filtro ────────────────────────────────────────────────────
  function handleFilter(filters) {
    setActiveFilters(filters);
    setHasFiltered(true);
  }

  // ── Exportación CSV ───────────────────────────────────────────────────────
  function handleExportCsv() {
    const date = new Date().toISOString().slice(0, 10);
    exportToCsv(
      displayRows,
      movementsColumns(bankAccountsById, TYPE_LABELS, STATUS_LABELS),
      `movimientos-${date}`,
    );
    logExport({ reportName: "MovementsReport", format: "CSV", filters: activeFilters ?? {}, rowCount: displayRows.length });
  }

  // ── Exportación XLSX (T-1608) ─────────────────────────────────────────────
  async function handleExportXlsx() {
    const date = new Date().toISOString().slice(0, 10);
    await exportToXlsx(
      [
        movementsSheet(displayRows, bankAccountsById, TYPE_LABELS, STATUS_LABELS),
        totalsByTypeSheet(displayRows, TYPE_LABELS),
      ],
      `movimientos-${date}`,
    );
    logExport({ reportName: "MovementsReport", format: "XLSX", filters: activeFilters ?? {}, rowCount: displayRows.length });
  }

  // ── Exportación PDF (T-1609) ──────────────────────────────────────────────
  async function handleExportPdf() {
    const date = new Date().toISOString().slice(0, 10);
    const from = activeFilters?.from ?? "";
    const to = activeFilters?.to ?? "";
    await exportToPdf(
      {
        title: "Reporte de Movimientos",
        period: from && to ? `${from} — ${to}` : undefined,
        sections: [{
          columns: movementsPdfColumns(bankAccountsById, TYPE_LABELS, STATUS_LABELS),
          rows: displayRows,
        }],
      },
      `movimientos-${date}`,
    );
    logExport({ reportName: "MovementsReport", format: "PDF", filters: activeFilters ?? {}, rowCount: displayRows.length });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reporte de Movimientos"
        description="Movimientos financieros filtrados por rango de fechas"
      />

      {/* ── Panel de filtros ─────────────────────────────────────────────── */}
      <ReportFilterPanel
        fields={["dateRange", "bankAccount", "movementType", "movementStatus", "currency"]}
        bankAccounts={bankAccounts}
        onFilter={handleFilter}
        loading={isLoading}
      />

      {/* ── Advertencia de límite ─────────────────────────────────────────── */}
      {overLimit && <LimitWarning />}

      {/* ── Sección de totales ────────────────────────────────────────────── */}
      {hasFiltered && <TotalsSection movements={displayRows} />}

      {/* ── Barra de acciones: resultado + exportación ────────────────────── */}
      {hasFiltered && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-500">
            {isLoading
              ? "Cargando…"
              : `${displayRows.length.toLocaleString("es-MX")} registro${displayRows.length !== 1 ? "s" : ""}`}
          </span>
          <ExportButtons
            onCsv={handleExportCsv}
            onXlsx={handleExportXlsx}
            onPdf={handleExportPdf}
            disabled={isLoading || displayRows.length === 0}
          />
        </div>
      )}

      {/* ── Tabla de resultados ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-meridian-500 border-t-transparent" />
        </div>
      ) : !hasFiltered || displayRows.length === 0 ? (
        <EmptyState hasFiltered={hasFiltered} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-surface-subtle">
                {["Fecha", "Cuenta", "Tipo", "Descripción", "Monto", "Estatus", "Referencia"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-400 first:pl-5 last:pr-5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {displayRows.map((row) => {
                const isIncome = INCOME_TYPES.has(row.movementType);
                const accountName = bankAccountsById[row.bankAccountId]?.name ?? "—";
                return (
                  <tr key={row.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-2.5 pl-5 font-mono text-xs text-ink-500 whitespace-nowrap">
                      {formatDate(row.occurredAt)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-700 max-w-[160px] truncate">
                      {accountName}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={TYPE_VARIANTS[row.movementType] ?? "neutral"} size="xs" dot>
                        {TYPE_LABELS[row.movementType] ?? row.movementType}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-700 max-w-[200px] truncate">
                      {row.description || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm font-medium tabular-nums whitespace-nowrap">
                      <span className={isIncome ? "text-success" : "text-error"}>
                        {isIncome ? "+" : "−"}{formatMoney(row.amount, row.currencyCode)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={STATUS_VARIANTS[row.status] ?? "neutral"} size="xs">
                        {STATUS_LABELS[row.status] ?? row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 pr-5 font-mono text-xs text-ink-400">
                      {row.reference || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
