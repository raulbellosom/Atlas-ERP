/**
 * TransfersReportPage — Reporte de transferencias bancarias del periodo.
 *
 * Muestra tabla de transferencias con totales por moneda (solo APPROVED).
 * Fuente: GET /api/v1/transfers con filtros de fecha, cuenta y estatus.
 *
 * Task origen: T-1604 (Fase 16 Bloque 1)
 * Decisión: totales calculados solo sobre transferencias APPROVED.
 */

import { useState, useMemo } from "react";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { useTransfersByFilters } from "@/modules/financial-operations/hooks/useTransfers";
import { useBankAccounts } from "@/modules/financial-operations/hooks/useBankAccounts";
import { ReportFilterPanel } from "@/modules/financial-operations/components/ReportFilterPanel";
import { exportToCsv, transfersColumns } from "@/modules/financial-operations/utils/exportCsv";
import { exportToXlsx, transfersSheet } from "@/modules/financial-operations/utils/exportXlsx";
import { exportToPdf, transfersPdfColumns } from "@/modules/financial-operations/utils/exportPdf";
import { useReportAudit } from "@/modules/financial-operations/hooks/useReportAudit";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  PENDING:  "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

const STATUS_VARIANTS = {
  PENDING:  "warning",
  APPROVED: "success",
  REJECTED: "error",
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

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

function maskAccountNumber(num) {
  if (!num) return "—";
  const s = String(num);
  return s.length > 4 ? `****${s.slice(-4)}` : s;
}


// ─── Sub-componentes ─────────────────────────────────────────────────────────

function TotalsSection({ transfers }) {
  const { approvedByCurrency, countByStatus } = useMemo(() => {
    const byCurrency = {};
    const byStatus = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    for (const t of transfers) {
      const status = t.status ?? "PENDING";
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      if (status === "APPROVED") {
        const currency = t.currencyCode ?? "MXN";
        byCurrency[currency] = (byCurrency[currency] ?? 0) + parseFloat(t.amount ?? "0");
      }
    }
    return { approvedByCurrency: byCurrency, countByStatus: byStatus };
  }, [transfers]);

  return (
    <div className="rounded-xl border border-ink-200 bg-surface-50 p-4 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Totales</h3>
      <div className="flex flex-wrap gap-6">
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400 mb-0.5">Pendientes</span>
          <span className="font-mono text-sm font-semibold text-amber-600">{countByStatus.PENDING}</span>
        </div>
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400 mb-0.5">Aprobadas</span>
          <span className="font-mono text-sm font-semibold text-success">{countByStatus.APPROVED}</span>
        </div>
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400 mb-0.5">Rechazadas</span>
          <span className="font-mono text-sm font-semibold text-error">{countByStatus.REJECTED}</span>
        </div>
      </div>
      {Object.keys(approvedByCurrency).length > 0 && (
        <div className="pt-3 border-t border-ink-100">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400 mb-2">
            Monto aprobado por moneda
          </span>
          <div className="flex flex-wrap gap-4">
            {Object.entries(approvedByCurrency).map(([currency, total]) => (
              <div key={currency} className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium text-ink-500">{currency}</span>
                <span className="font-mono text-sm font-semibold text-success">
                  {formatMoney(total, currency)}
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
          <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
        </svg>
      </div>
      <p className="text-sm font-medium text-ink-700">
        {hasFiltered ? "Sin transferencias en el periodo seleccionado" : "Aplica los filtros para generar el reporte"}
      </p>
      <p className="mt-1 text-xs text-ink-400">
        {hasFiltered
          ? "Prueba ampliando el rango de fechas o cambiando los filtros."
          : "Selecciona el rango de fechas y haz clic en Aplicar filtros."}
      </p>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function TransfersReportPage() {
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

  // ReportFilterPanel para transfers usa: dateRange + status (PENDING/APPROVED/REJECTED)
  // La cuenta origen/destino se filtra en el reporte (el API no distingue origen/destino en filtro)
  const apiFilters = useMemo(() => {
    if (!activeFilters) return {};
    return {
      ...(activeFilters.from ? { from: activeFilters.from } : {}),
      ...(activeFilters.to ? { to: activeFilters.to } : {}),
      ...(activeFilters.statuses?.length ? { status: activeFilters.statuses } : {}),
    };
  }, [activeFilters]);

  const { data: transfers = [], isLoading, error } = useTransfersByFilters(
    organizationId,
    apiFilters,
    Boolean(activeFilters),
  );

  if (error) handleError(error);

  function handleFilter(filters) {
    setActiveFilters(filters);
    setHasFiltered(true);
  }

  function handleExportCsv() {
    const date = new Date().toISOString().slice(0, 10);
    exportToCsv(transfers, transfersColumns(bankAccountsById, STATUS_LABELS), `transferencias-${date}`);
    logExport({ reportName: "TransfersReport", format: "CSV", filters: activeFilters ?? {}, rowCount: transfers.length });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reporte de Transferencias"
        description="Transferencias bancarias del periodo con trazabilidad de aprobación"
      />

      <ReportFilterPanel
        fields={["dateRange", "status"]}
        bankAccounts={bankAccounts}
        onFilter={handleFilter}
        loading={isLoading}
      />

      {hasFiltered && <TotalsSection transfers={transfers} />}

      {hasFiltered && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-500">
            {isLoading
              ? "Cargando…"
              : `${transfers.length.toLocaleString("es-MX")} transferencia${transfers.length !== 1 ? "s" : ""}`}
          </span>
          <div className="flex items-center gap-2">
            {[
              { label: "CSV", onClick: handleExportCsv },
              { label: "XLSX", onClick: () => { const d = new Date().toISOString().slice(0,10); exportToXlsx([transfersSheet(transfers, bankAccountsById, STATUS_LABELS)], `transferencias-${d}`); logExport({ reportName: "TransfersReport", format: "XLSX", filters: activeFilters ?? {}, rowCount: transfers.length }); } },
              { label: "PDF", onClick: () => { const d = new Date().toISOString().slice(0,10); exportToPdf({ title: "Reporte de Transferencias", sections: [{ columns: transfersPdfColumns(bankAccountsById, STATUS_LABELS), rows: transfers }] }, `transferencias-${d}`); logExport({ reportName: "TransfersReport", format: "PDF", filters: activeFilters ?? {}, rowCount: transfers.length }); } },
            ].map(({ label, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                disabled={isLoading || transfers.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-subtle disabled:opacity-40 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-meridian-500 border-t-transparent" />
        </div>
      ) : !hasFiltered || transfers.length === 0 ? (
        <EmptyState hasFiltered={hasFiltered} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-surface-subtle">
                {["Fecha", "Cuenta origen", "Cuenta destino", "Monto", "Estatus", "Referencia"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-400 first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {transfers.map((t) => {
                const from = bankAccountsById[t.fromAccountId];
                const to = bankAccountsById[t.toAccountId];
                return (
                  <tr key={t.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-2.5 pl-5 font-mono text-xs text-ink-500 whitespace-nowrap">
                      {formatDate(t.transferDate ?? t.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-medium text-ink-700">{from?.name ?? "—"}</div>
                      {from?.accountNumber && (
                        <div className="font-mono text-[10px] text-ink-400">
                          {maskAccountNumber(from.accountNumber)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-medium text-ink-700">{to?.name ?? "—"}</div>
                      {to?.accountNumber && (
                        <div className="font-mono text-[10px] text-ink-400">
                          {maskAccountNumber(to.accountNumber)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold tabular-nums whitespace-nowrap text-ink-800">
                      {formatMoney(t.amount, t.currencyCode)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={STATUS_VARIANTS[t.status] ?? "neutral"} size="xs">
                        {STATUS_LABELS[t.status] ?? t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 pr-5 text-xs text-ink-400 max-w-[160px] truncate">
                      {t.reference ?? t.notes ?? "—"}
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
