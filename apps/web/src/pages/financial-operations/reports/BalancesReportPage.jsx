/**
 * BalancesReportPage — Reporte de saldos bancarios.
 *
 * Combina tres perspectivas:
 *   1. Resumen global: totales por moneda + cuentas activas/inactivas.
 *   2. Saldos actuales por cuenta.
 *   3. Historial de cortes (balance snapshots) filtrable y exportable.
 *
 * Task origen: T-1603 (Fase 16 Bloque 1)
 */

import { useEffect, useState, useMemo } from "react";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { useBankAccounts, useBalanceSummary } from "@/modules/financial-operations/hooks/useBankAccounts";
import { useBalanceSnapshots } from "@/modules/financial-operations/hooks/useBalances";
import { ReportFilterPanel } from "@/modules/financial-operations/components/ReportFilterPanel";
import { exportToCsv, snapshotsColumns } from "@/modules/financial-operations/utils/exportCsv";
import { exportToXlsx } from "@/modules/financial-operations/utils/exportXlsx";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

// ─── Utilidades ───────────────────────────────────────────────────────────────

function formatMoney(amount, currency = "MXN") {
  const val = parseFloat(amount ?? "0");
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(val);
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}


// ─── Sección: Resumen global ──────────────────────────────────────────────────

function SummarySection({ summary, accounts }) {
  const activeCount = summary?.activeAccountCount ?? accounts.filter((a) => a.isActive).length;
  const totalCount = summary?.accountCount ?? accounts.length;
  const totals = summary?.totalsByCurrency ?? [];

  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden">
      <div className="border-b border-ink-100 bg-surface-subtle px-5 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Resumen global</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div className="rounded-lg border border-ink-100 bg-white p-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">Cuentas activas</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{activeCount}</p>
          <p className="mt-0.5 text-xs text-ink-400">de {totalCount} totales</p>
        </div>
        {totals.map((tc) => {
          const bal = parseFloat(tc.totalBalance ?? "0");
          return (
            <div key={tc.currencyCode} className="rounded-lg border border-ink-100 bg-white p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">
                Total {tc.currencyCode}
              </p>
              <p className={`mt-2 font-mono text-2xl font-bold tabular-nums ${bal >= 0 ? "text-success" : "text-error"}`}>
                {formatMoney(bal, tc.currencyCode)}
              </p>
              <p className="mt-0.5 text-xs text-ink-400">
                {tc.accountCount} cuenta{tc.accountCount !== 1 ? "s" : ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sección: Saldos actuales ─────────────────────────────────────────────────

function CurrentBalancesSection({ accounts }) {
  const activeAccounts = useMemo(() => accounts.filter((a) => a.isActive), [accounts]);

  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden">
      <div className="border-b border-ink-100 bg-surface-subtle px-5 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Saldos actuales — {activeAccounts.length} cuenta{activeAccounts.length !== 1 ? "s" : ""} activa{activeAccounts.length !== 1 ? "s" : ""}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-ink-50">
              {["Cuenta", "Banco", "Moneda", "Saldo actual", "Última actualización"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-400 first:pl-5 last:pr-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {activeAccounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-ink-400">Sin cuentas activas</td>
              </tr>
            ) : activeAccounts.map((a) => {
              const bal = parseFloat(a.currentBalance ?? "0");
              return (
                <tr key={a.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-2.5 pl-5 font-medium text-sm text-ink-800">{a.name}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-500">{a.bankName ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="blue" size="xs">{a.currencyCode ?? "MXN"}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-mono text-sm font-semibold tabular-nums ${bal >= 0 ? "text-success" : "text-error"}`}>
                      {formatMoney(bal, a.currencyCode)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 pr-5 text-xs text-ink-400">{formatDate(a.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sección: Historial de cortes ─────────────────────────────────────────────

function SnapshotsSection({ organizationId, bankAccounts, bankAccountsById }) {
  const { handleError } = useApiError();
  const [snapFilters, setSnapFilters] = useState(null);
  const [hasFiltered, setHasFiltered] = useState(false);

  const queryFilters = useMemo(() => ({
    ...(snapFilters?.from ? { from: snapFilters.from } : {}),
    ...(snapFilters?.bankAccountId ? { bankAccountId: snapFilters.bankAccountId } : {}),
    ...(snapFilters?.to ? { to: snapFilters.to } : {}),
  }), [snapFilters]);

  const { data: snapshots = [], isLoading, error } = useBalanceSnapshots(
    organizationId,
    queryFilters,
  );

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  function handleFilter(filters) {
    setSnapFilters(filters);
    setHasFiltered(true);
  }

  function handleExportCsv() {
    const date = new Date().toISOString().slice(0, 10);
    exportToCsv(snapshots, snapshotsColumns(bankAccountsById), `cortes-saldo-${date}`);
  }

  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden">
      <div className="border-b border-ink-100 bg-surface-subtle px-5 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Historial de cortes</h3>
      </div>
      <div className="p-4 border-b border-ink-100">
        <ReportFilterPanel
          fields={["dateRange", "bankAccount"]}
          bankAccounts={bankAccounts}
          onFilter={handleFilter}
          loading={isLoading}
        />
      </div>

      {hasFiltered && (
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-ink-50">
          <span className="text-xs text-ink-500">
            {isLoading ? "Cargando…" : `${snapshots.length} corte${snapshots.length !== 1 ? "s" : ""}`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isLoading || snapshots.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-subtle disabled:opacity-40 transition-colors"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => { const d = new Date().toISOString().slice(0,10); exportToXlsx([{ name: "Cortes", columns: snapshotsColumns(bankAccountsById).map(c=>({...c, type: c.header==="Monto"?"number":"string"})), rows: snapshots }], `cortes-saldo-${d}`); }}
              disabled={isLoading || snapshots.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-subtle disabled:opacity-40 transition-colors"
            >
              XLSX
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-meridian-500 border-t-transparent" />
          </div>
        ) : !hasFiltered ? (
          <div className="py-10 text-center text-xs text-ink-400">
            Selecciona el rango de fechas para ver los cortes de saldo
          </div>
        ) : snapshots.length === 0 ? (
          <div className="py-10 text-center text-xs text-ink-400">
            Sin cortes de saldo en el periodo seleccionado
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-50">
                {["Fecha de corte", "Cuenta", "Banco", "Moneda", "Monto", "Origen"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-400 first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {snapshots.map((snap) => {
                const account = bankAccountsById[snap.bankAccountId];
                const bal = parseFloat(snap.balance ?? "0");
                return (
                  <tr key={snap.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-2.5 pl-5 font-mono text-xs text-ink-500 whitespace-nowrap">
                      {formatDateShort(snap.snapshotDate ?? snap.recordedAt)}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-ink-700">
                      {account?.name ?? snap.bankAccountId ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-500">{account?.bankName ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="blue" size="xs">
                        {snap.currencyCode ?? account?.currencyCode ?? "MXN"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold tabular-nums">
                      <span className={bal >= 0 ? "text-success" : "text-error"}>
                        {formatMoney(bal, snap.currencyCode ?? account?.currencyCode ?? "MXN")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 pr-5">
                      <Badge variant={snap.source === "MANUAL" ? "warning" : "info"} size="xs">
                        {snap.source ?? "—"}
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
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function BalancesReportPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const { data: accounts = [], isLoading: loadingAccounts, error: accountsErr } = useBankAccounts(organizationId);
  const { data: summary, isLoading: loadingSummary, error: summaryErr } = useBalanceSummary(organizationId);

  useEffect(() => {
    if (accountsErr) handleError(accountsErr);
    if (summaryErr) handleError(summaryErr);
  }, [accountsErr, summaryErr, handleError]);

  const bankAccountsById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a])),
    [accounts],
  );

  const isLoading = loadingAccounts || loadingSummary;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reporte de Saldos"
        description="Resumen global, saldos actuales e historial de cortes bancarios"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-meridian-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <SummarySection summary={summary} accounts={accounts} />
          <CurrentBalancesSection accounts={accounts} />
          <SnapshotsSection
            organizationId={organizationId}
            bankAccounts={accounts}
            bankAccountsById={bankAccountsById}
          />
        </>
      )}
    </div>
  );
}
