/**
 * MovementsByAccountReportPage — Reporte de movimientos agrupado por cuenta bancaria.
 *
 * Muestra una sección por cuenta con saldo inicial, movimientos del periodo,
 * subtotales y saldo estimado final.
 *
 * Task origen: T-1602 (Fase 16 Bloque 1)
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { useBankAccounts } from "@/modules/financial-operations/hooks/useBankAccounts";
import { fetchMovementsByFilters } from "@/modules/financial-operations/api/movements.api";
import { fetchBankAccountBalance } from "@/modules/financial-operations/api/bank-accounts.api";
import { ReportFilterPanel } from "@/modules/financial-operations/components/ReportFilterPanel";
import { exportToCsv, movementsColumns } from "@/modules/financial-operations/utils/exportCsv";
import { exportToXlsx, movementsSheet } from "@/modules/financial-operations/utils/exportXlsx";
import { exportToPdf, movementsPdfColumns } from "@/modules/financial-operations/utils/exportPdf";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

// ─── Constantes ───────────────────────────────────────────────────────────────

const INCOME_TYPES = new Set(["INCOME", "TRANSFER_IN"]);

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
  PENDING:   "Pendiente",
  CONFIRMED: "Confirmado",
  POSTED:    "Contabilizado",
  VOIDED:    "Anulado",
};

const STATUS_VARIANTS = {
  PENDING:   "warning",
  CONFIRMED: "success",
  POSTED:    "primary",
  VOIDED:    "neutral",
};

// ─── Utilidades ──────────────────────────────────────────────────────────────

function formatMoney(amount, currency = "MXN") {
  if (amount == null || isNaN(parseFloat(amount))) return "N/D";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ─── Hook para cargar movimientos de múltiples cuentas en paralelo ────────────

function useAccountMovements(organizationId, accountIds, filters, enabled) {
  return useQuery({
    queryKey: ["movements-by-account-report", organizationId, accountIds, filters],
    queryFn: async () => {
      const results = await Promise.all(
        accountIds.map((id) =>
          fetchMovementsByFilters({ organizationId, bankAccountId: id, ...filters }),
        ),
      );
      return Object.fromEntries(accountIds.map((id, i) => [id, results[i]]));
    },
    enabled: Boolean(organizationId) && enabled && accountIds.length > 0,
  });
}

function useAccountBalances(accountIds) {
  return useQuery({
    queryKey: ["account-balances-report", accountIds],
    queryFn: async () => {
      const results = await Promise.allSettled(
        accountIds.map((id) => fetchBankAccountBalance(id)),
      );
      return Object.fromEntries(
        accountIds.map((id, i) => [
          id,
          results[i].status === "fulfilled" ? results[i].value : null,
        ]),
      );
    },
    enabled: accountIds.length > 0,
  });
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function AccountSection({ account, movements, openingBalance }) {
  const currency = account.currency ?? "MXN";

  const { totalIncome, totalExpense, netDiff } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const m of movements) {
      const amount = parseFloat(m.amount ?? "0");
      if (INCOME_TYPES.has(m.movementType)) inc += amount;
      else exp += amount;
    }
    return { totalIncome: inc, totalExpense: exp, netDiff: inc - exp };
  }, [movements]);

  const openingNum = openingBalance != null ? parseFloat(openingBalance) : null;
  const closingBalance = openingNum != null ? openingNum + netDiff : null;

  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden">
      {/* Header de cuenta */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 bg-surface-subtle px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{account.name}</h3>
          <p className="text-xs text-ink-400">
            {account.bankName ?? "Banco"} · {account.accountNumber ? `****${account.accountNumber.slice(-4)}` : "—"} · {currency}
          </p>
        </div>
        <div className="flex gap-6 text-xs text-ink-500">
          <div>
            <span className="block font-medium text-ink-400 uppercase tracking-wide text-[10px]">Saldo inicial (estimado)</span>
            <span className="font-mono text-sm text-ink-700">{formatMoney(openingNum, currency)}</span>
          </div>
          <div>
            <span className="block font-medium text-ink-400 uppercase tracking-wide text-[10px]">Saldo final (estimado)</span>
            <span className={`font-mono text-sm font-semibold ${closingBalance == null ? "text-ink-400" : closingBalance >= 0 ? "text-success" : "text-error"}`}>
              {closingBalance == null ? "N/D" : formatMoney(closingBalance, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de movimientos */}
      {movements.length === 0 ? (
        <div className="py-8 text-center text-xs text-ink-400">
          Sin movimientos en el periodo para esta cuenta
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-50">
                {["Fecha", "Tipo", "Descripción", "Monto", "Estatus", "Referencia"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-400 first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {movements.map((m) => {
                const isIncome = INCOME_TYPES.has(m.movementType);
                return (
                  <tr key={m.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-2 pl-5 font-mono text-xs text-ink-500 whitespace-nowrap">
                      {formatDate(m.occurredAt)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={TYPE_VARIANTS[m.movementType] ?? "neutral"} size="xs" dot>
                        {TYPE_LABELS[m.movementType] ?? m.movementType}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-ink-700 max-w-[200px] truncate">
                      {m.description || "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-sm font-medium tabular-nums whitespace-nowrap">
                      <span className={isIncome ? "text-success" : "text-error"}>
                        {isIncome ? "+" : "−"}{formatMoney(m.amount, m.currencyCode ?? currency)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={STATUS_VARIANTS[m.status] ?? "neutral"} size="xs">
                        {STATUS_LABELS[m.status] ?? m.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 pr-5 font-mono text-xs text-ink-400">
                      {m.reference || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Subtotales */}
      <div className="flex flex-wrap gap-6 border-t border-ink-100 bg-surface-50 px-5 py-3">
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400">Ingresos</span>
          <span className="font-mono text-sm font-semibold text-success">{formatMoney(totalIncome, currency)}</span>
        </div>
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400">Egresos</span>
          <span className="font-mono text-sm font-semibold text-error">{formatMoney(totalExpense, currency)}</span>
        </div>
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400">Diferencia neta</span>
          <span className={`font-mono text-sm font-semibold ${netDiff >= 0 ? "text-success" : "text-error"}`}>
            {formatMoney(netDiff, currency)}
          </span>
        </div>
        <div className="ml-auto text-xs text-ink-400 self-center">
          {movements.length} movimiento{movements.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

function GlobalTotals({ accountSections }) {
  const netByCurrency = useMemo(() => {
    const acc = {};
    for (const { account, movements } of accountSections) {
      const currency = account.currency ?? "MXN";
      let net = 0;
      for (const m of movements) {
        const amount = parseFloat(m.amount ?? "0");
        net += INCOME_TYPES.has(m.movementType) ? amount : -amount;
      }
      acc[currency] = (acc[currency] ?? 0) + net;
    }
    return acc;
  }, [accountSections]);

  return (
    <div className="rounded-xl border border-ink-200 bg-surface-50 px-5 py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Totales globales</h3>
      <div className="flex flex-wrap gap-6">
        {Object.entries(netByCurrency).map(([currency, net]) => (
          <div key={currency}>
            <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400 mb-0.5">{currency}</span>
            <span className={`font-mono text-sm font-semibold ${net >= 0 ? "text-success" : "text-error"}`}>
              {formatMoney(net, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MovementsByAccountReportPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const [activeFilters, setActiveFilters] = useState(null);
  const [hasFiltered, setHasFiltered] = useState(false);

  const { data: bankAccounts = [] } = useBankAccounts(organizationId);

  // Accounts to report: selected or all
  const selectedAccountIds = useMemo(() => {
    if (!activeFilters?.bankAccountIds?.length) {
      return bankAccounts.map((a) => a.id);
    }
    return activeFilters.bankAccountIds;
  }, [activeFilters, bankAccounts]);

  const bankAccountsById = useMemo(
    () => Object.fromEntries(bankAccounts.map((a) => [a.id, a])),
    [bankAccounts],
  );

  const dateFilters = useMemo(() => ({
    from: activeFilters?.from,
    to: activeFilters?.to,
  }), [activeFilters]);

  const {
    data: movementsByAccount = {},
    isLoading: loadingMovements,
    error: movementsError,
  } = useAccountMovements(organizationId, selectedAccountIds, dateFilters, hasFiltered);

  const {
    data: balancesByAccount = {},
    isLoading: loadingBalances,
  } = useAccountBalances(hasFiltered ? selectedAccountIds : []);

  if (movementsError) handleError(movementsError);

  const isLoading = loadingMovements || loadingBalances;

  const accountSections = useMemo(() =>
    selectedAccountIds
      .filter((id) => bankAccountsById[id])
      .map((id) => ({
        account: bankAccountsById[id],
        movements: movementsByAccount[id] ?? [],
        openingBalance: balancesByAccount[id]?.balance ?? null,
      })),
    [selectedAccountIds, bankAccountsById, movementsByAccount, balancesByAccount],
  );

  function handleFilter(filters) {
    setActiveFilters(filters);
    setHasFiltered(true);
  }

  function handleExportCsv() {
    const date = new Date().toISOString().slice(0, 10);
    // Flatten all movements with an account name prefix column
    const accountById = bankAccountsById;
    const allRows = accountSections.flatMap(({ account, movements }) =>
      movements.map((m) => ({ ...m, _accountName: account.name })),
    );
    const cols = [
      { key: "_accountName", header: "Cuenta" },
      ...movementsColumns(accountById, TYPE_LABELS, STATUS_LABELS).slice(1),
    ];
    exportToCsv(allRows, cols, `movimientos-por-cuenta-${date}`);
  }

  async function handleExportXlsx() {
    const date = new Date().toISOString().slice(0, 10);
    const sheets = accountSections.map(({ account, movements }) =>
      movementsSheet(movements, bankAccountsById, TYPE_LABELS, STATUS_LABELS, account.name.slice(0, 31)),
    );
    await exportToXlsx(sheets, `movimientos-por-cuenta-${date}`);
  }

  async function handleExportPdf() {
    const date = new Date().toISOString().slice(0, 10);
    const sections = accountSections.map(({ account, movements }) => ({
      title: account.name,
      columns: movementsPdfColumns(bankAccountsById, TYPE_LABELS, STATUS_LABELS),
      rows: movements,
    }));
    await exportToPdf({ title: "Movimientos por Cuenta", sections }, `movimientos-por-cuenta-${date}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reporte por Cuenta"
        description="Movimientos del periodo agrupados por cuenta bancaria"
      />

      <ReportFilterPanel
        fields={["dateRange", "bankAccounts"]}
        bankAccounts={bankAccounts}
        onFilter={handleFilter}
        loading={isLoading}
      />

      {hasFiltered && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-500">
            {isLoading
              ? "Cargando…"
              : `${selectedAccountIds.length} cuenta${selectedAccountIds.length !== 1 ? "s" : ""}`}
          </span>
          <div className="flex items-center gap-2">
            {[
              { label: "CSV", onClick: handleExportCsv },
              { label: "XLSX", onClick: handleExportXlsx },
              { label: "PDF", onClick: handleExportPdf },
            ].map(({ label, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                disabled={isLoading || accountSections.length === 0}
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
      ) : !hasFiltered ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-ink-700">Aplica los filtros para generar el reporte</p>
          <p className="mt-1 text-xs text-ink-400">Selecciona el rango de fechas y las cuentas a incluir.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accountSections.map(({ account, movements, openingBalance }) => (
            <AccountSection
              key={account.id}
              account={account}
              movements={movements}
              openingBalance={openingBalance}
            />
          ))}
          {accountSections.length > 1 && <GlobalTotals accountSections={accountSections} />}
        </div>
      )}
    </div>
  );
}
