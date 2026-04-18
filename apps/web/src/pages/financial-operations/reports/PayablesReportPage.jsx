/**
 * PayablesReportPage — Reporte de cuentas por pagar con aging de pasivos.
 *
 * Simétrico a ReceivablesReportPage (T-1605). Mismos buckets de aging,
 * misma lógica de KPIs aplicada a payables.
 *
 * Task origen: T-1606 (Fase 16 Bloque 2)
 */

import { useState, useMemo } from "react";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { usePayables } from "@/modules/financial-operations/hooks/useCxcCxp";
import { ReportFilterPanel } from "@/modules/financial-operations/components/ReportFilterPanel";
import { exportToCsv, receivablesPayablesColumns } from "@/modules/financial-operations/utils/exportCsv";
import { exportToXlsx, cxcCxpDetailSheet } from "@/modules/financial-operations/utils/exportXlsx";
import { exportToPdf, cxcCxpPdfColumns } from "@/modules/financial-operations/utils/exportPdf";
import { useReportAudit } from "@/modules/financial-operations/hooks/useReportAudit";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  OPEN:    "Abierto",
  PARTIAL: "Parcial",
  PAID:    "Pagado",
  OVERDUE: "Vencido",
  VOIDED:  "Anulado",
};

const STATUS_VARIANTS = {
  OPEN:    "warning",
  PARTIAL: "info",
  PAID:    "success",
  OVERDUE: "error",
  VOIDED:  "neutral",
};

const ACTIVE_STATUSES = new Set(["OPEN", "PARTIAL", "OVERDUE"]);

const AGING_BUCKETS = [
  { key: "current",  label: "Corriente",   test: (d) => d >= 0 },
  { key: "d1_30",   label: "1-30 días",    test: (d) => d >= -30 && d < 0 },
  { key: "d31_60",  label: "31-60 días",   test: (d) => d >= -60 && d < -30 },
  { key: "d61_90",  label: "61-90 días",   test: (d) => d >= -90 && d < -60 },
  { key: "d90plus", label: "+90 días",     test: (d) => d < -90 },
];

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

function daysDiff(isoDate) {
  if (!isoDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(isoDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function pendingAmount(r) {
  return Math.max(0, parseFloat(r.amount ?? "0") - parseFloat(r.amountPaid ?? "0"));
}


function computeKpis(items) {
  let totalPending = 0;
  let totalOverdue = 0;
  let dueSoon = 0;

  for (const r of items) {
    if (!ACTIVE_STATUSES.has(r.status)) continue;
    const pend = pendingAmount(r);
    totalPending += pend;
    const dd = daysDiff(r.dueAt);
    if (dd !== null && dd < 0) totalOverdue += pend;
    else if (dd !== null && dd >= 0 && dd <= 30) dueSoon += pend;
  }

  const pctOverdue = totalPending > 0 ? (totalOverdue / totalPending) * 100 : 0;
  return { totalPending, totalOverdue, dueSoon, pctOverdue };
}

function computeAging(items) {
  const map = {};
  for (const r of items) {
    if (!ACTIVE_STATUSES.has(r.status)) continue;
    const cpName = r.counterpartyName ?? r.counterparty ?? r.description ?? "Sin proveedor";
    if (!map[cpName]) {
      map[cpName] = { name: cpName, current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90plus: 0, total: 0 };
    }
    const pend = pendingAmount(r);
    const dd = daysDiff(r.dueAt);
    for (const bucket of AGING_BUCKETS) {
      if (dd === null || bucket.test(dd)) {
        map[cpName][bucket.key] += pend;
        break;
      }
    }
    map[cpName].total += pend;
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function KpiCards({ kpis }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[
        { label: "Total por pagar", value: formatMoney(kpis.totalPending), color: "text-ink-900" },
        { label: "Pasivos vencidos", value: formatMoney(kpis.totalOverdue), color: "text-error" },
        { label: "Vence en 30 días", value: formatMoney(kpis.dueSoon), color: "text-amber-600" },
        { label: "% pasivos vencidos", value: `${kpis.pctOverdue.toFixed(1)}%`, color: kpis.pctOverdue > 20 ? "text-error" : "text-ink-700" },
      ].map(({ label, value, color }) => (
        <div key={label} className="rounded-xl border border-ink-200 bg-white p-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
          <p className={`mt-2 font-mono text-2xl font-bold tabular-nums ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function AgingTable({ rows }) {
  if (rows.length === 0) return null;
  const currency = "MXN";

  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden">
      <div className="border-b border-ink-100 bg-surface-subtle px-5 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Aging por proveedor</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-ink-50">
              <th className="px-4 py-2.5 pl-5 text-left font-semibold uppercase tracking-wide text-ink-400">Proveedor</th>
              {AGING_BUCKETS.map((b) => (
                <th key={b.key} className="px-4 py-2.5 text-right font-semibold uppercase tracking-wide text-ink-400">{b.label}</th>
              ))}
              <th className="px-4 py-2.5 pr-5 text-right font-semibold uppercase tracking-wide text-ink-400">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {rows.map((row) => (
              <tr key={row.name} className="hover:bg-surface-subtle">
                <td className="px-4 py-2 pl-5 font-medium text-ink-700 max-w-[180px] truncate">{row.name}</td>
                {AGING_BUCKETS.map((b) => (
                  <td key={b.key} className={`px-4 py-2 text-right font-mono tabular-nums ${row[b.key] > 0 ? (b.key !== "current" ? "text-error font-medium" : "text-ink-700") : "text-ink-300"}`}>
                    {row[b.key] > 0 ? formatMoney(row[b.key], currency) : "—"}
                  </td>
                ))}
                <td className="px-4 py-2 pr-5 text-right font-mono font-semibold tabular-nums text-ink-900">
                  {formatMoney(row.total, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PayablesReportPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { logExport } = useReportAudit();

  const [activeFilters, setActiveFilters] = useState(null);

  const { data: allPayables = [], isLoading, error } = usePayables(organizationId);
  if (error) handleError(error);

  const kpis = useMemo(() => computeKpis(allPayables), [allPayables]);
  const agingRows = useMemo(() => computeAging(allPayables), [allPayables]);

  const filteredItems = useMemo(() => {
    if (!activeFilters) return allPayables;
    return allPayables.filter((r) => {
      if (activeFilters.statuses?.length && !activeFilters.statuses.includes(r.status)) return false;
      if (activeFilters.from && r.dueAt < activeFilters.from) return false;
      if (activeFilters.to && r.dueAt > activeFilters.to) return false;
      if (activeFilters.counterparty) {
        const q = activeFilters.counterparty.toLowerCase();
        const cp = (r.counterpartyName ?? r.counterparty ?? r.description ?? "").toLowerCase();
        if (!cp.includes(q)) return false;
      }
      return true;
    });
  }, [allPayables, activeFilters]);

  function handleFilter(filters) {
    setActiveFilters(filters);
  }

  function handleExportCsv() {
    const date = new Date().toISOString().slice(0, 10);
    exportToCsv(
      filteredItems,
      receivablesPayablesColumns(STATUS_LABELS, pendingAmount),
      `cuentas-por-pagar-${date}`,
    );
    logExport({ reportName: "PayablesReport", format: "CSV", filters: activeFilters ?? {}, rowCount: filteredItems.length });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reporte CxP"
        description="Cuentas por pagar — pasivos, aging por proveedor y detalle"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-meridian-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <KpiCards kpis={kpis} />
          <AgingTable rows={agingRows} />

          <div className="rounded-xl border border-ink-200 overflow-hidden">
            <div className="border-b border-ink-100 bg-surface-subtle px-5 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Detalle</h3>
            </div>
            <div className="p-4 border-b border-ink-100">
              <ReportFilterPanel
                fields={["dateRange", "status", "counterparty"]}
                onFilter={handleFilter}
                liveFilter={false}
                loading={isLoading}
              />
            </div>

            <div className="flex items-center justify-between px-5 py-2.5 border-b border-ink-50">
              <span className="text-xs text-ink-500">
                {filteredItems.length} registro{filteredItems.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                {[
                  { label: "CSV", onClick: handleExportCsv },
                  { label: "XLSX", onClick: () => { const d = new Date().toISOString().slice(0,10); exportToXlsx([cxcCxpDetailSheet(filteredItems, STATUS_LABELS, pendingAmount, "CxP")], `cuentas-por-pagar-${d}`); logExport({ reportName: "PayablesReport", format: "XLSX", filters: activeFilters ?? {}, rowCount: filteredItems.length }); } },
                  { label: "PDF", onClick: () => { const d = new Date().toISOString().slice(0,10); exportToPdf({ title: "Reporte CxP", sections: [{ title: "Detalle", columns: cxcCxpPdfColumns(STATUS_LABELS, pendingAmount), rows: filteredItems }] }, `cuentas-por-pagar-${d}`); logExport({ reportName: "PayablesReport", format: "PDF", filters: activeFilters ?? {}, rowCount: filteredItems.length }); } },
                ].map(({ label, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    disabled={filteredItems.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-subtle disabled:opacity-40 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredItems.length === 0 ? (
                <div className="py-10 text-center text-xs text-ink-400">
                  Sin registros que coincidan con los filtros
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-50">
                      {["Referencia", "Descripción", "Monto", "Pagado", "Pendiente", "Vencimiento", "Estatus"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-400 first:pl-5 last:pr-5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {filteredItems.map((r) => {
                      const pend = pendingAmount(r);
                      const dd = daysDiff(r.dueAt);
                      const isOverdue = dd !== null && dd < 0 && ACTIVE_STATUSES.has(r.status);
                      return (
                        <tr key={r.id} className={`hover:bg-surface-subtle transition-colors ${isOverdue ? "bg-red-50/40" : ""}`}>
                          <td className="px-4 py-2.5 pl-5 font-mono text-xs text-ink-500">
                            {r.reference ?? r.externalReference ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-ink-700 max-w-[200px] truncate">
                            {r.description || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-sm font-medium tabular-nums text-ink-800">
                            {formatMoney(r.amount, r.currencyCode)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums text-success">
                            {formatMoney(r.amountPaid, r.currencyCode)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold tabular-nums text-error">
                            {pend > 0 ? formatMoney(pend, r.currencyCode) : "—"}
                          </td>
                          <td className={`px-4 py-2.5 font-mono text-xs ${isOverdue ? "text-error font-medium" : "text-ink-500"}`}>
                            {formatDate(r.dueAt)}
                            {isOverdue && ` (${Math.abs(dd)}d)`}
                          </td>
                          <td className="px-4 py-2.5 pr-5">
                            <Badge variant={STATUS_VARIANTS[r.status] ?? "neutral"} size="xs">
                              {STATUS_LABELS[r.status] ?? r.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
