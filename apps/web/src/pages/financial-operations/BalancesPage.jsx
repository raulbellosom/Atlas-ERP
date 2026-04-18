import { useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { useBankAccounts, useBalanceSummary } from "@/modules/financial-operations/hooks/useBankAccounts";
import { formatDate } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Spinner from "@/components/ui/Spinner";
import PageHeader from "@/components/ui/PageHeader";

/**
 * BalancesPage — Dashboard de saldos financieros.
 *
 * - Cards de resumen: total por moneda, cuentas activas
 * - Tabla de cuentas con saldo actual
 */

function formatMoney(amount, currency = "MXN") {
  const val = parseFloat(amount ?? "0");
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(val);
}

export default function BalancesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const { data: accounts = [], isLoading: loadingAccounts, error: accountsErr } = useBankAccounts(organizationId);
  const { data: summary, isLoading: loadingSummary, error: summaryErr } = useBalanceSummary(organizationId);

  useEffect(() => {
    if (accountsErr) handleError(accountsErr);
    if (summaryErr) handleError(summaryErr);
  }, [accountsErr, summaryErr, handleError]);

  const activeAccounts = accounts.filter((a) => a.isActive);

  const COLUMNS = [
    {
      key: "name",
      header: "Cuenta",
      sortable: true,
      render: (row) => (
        <Link
          to={`/financial-operations/bank-accounts/${row.id}`}
          className="font-medium text-ink-700 hover:text-ink-900 transition-colors hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    { key: "bankName", header: "Banco", sortable: true },
    {
      key: "currencyCode",
      header: "Moneda",
      render: (row) => <Badge variant="blue" size="xs">{row.currencyCode ?? "MXN"}</Badge>,
    },
    {
      key: "currentBalance",
      header: "Saldo",
      sortable: true,
      render: (row) => {
        const bal = parseFloat(row.currentBalance ?? "0");
        return (
          <span className={[
            "font-mono text-sm tabular-nums font-medium",
            bal >= 0 ? "text-success" : "text-error",
          ].join(" ")}>
            {formatMoney(row.currentBalance, row.currencyCode)}
          </span>
        );
      },
    },
    {
      key: "isActive",
      header: "Estado",
      render: (row) => row.isActive
        ? <Badge variant="green" size="xs">Activa</Badge>
        : <Badge variant="gray" size="xs">Inactiva</Badge>,
    },
    {
      key: "updatedAt",
      header: "Actualizado",
      render: (row) => <span className="text-xs text-text-secondary">{formatDate(row.updatedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saldos y resumen"
        description="Panorama financiero de la organización"
      />

      {/* Summary cards */}
      {loadingSummary ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active accounts */}
          <Card>
            <div className="p-4">
              <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Cuentas activas</p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {summary?.activeAccountCount ?? activeAccounts.length}
              </p>
            </div>
          </Card>

          {/* Total accounts */}
          <Card>
            <div className="p-4">
              <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Total cuentas</p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {summary?.accountCount ?? accounts.length}
              </p>
            </div>
          </Card>

          {/* Totals by currency */}
          {(summary?.totalsByCurrency ?? []).map((tc) => (
            <Card key={tc.currencyCode}>
              <div className="p-4">
                <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                  Total {tc.currencyCode}
                </p>
                <p className={[
                  "text-2xl font-bold font-mono tabular-nums mt-2",
                  parseFloat(tc.totalBalance) >= 0 ? "text-success" : "text-error",
                ].join(" ")}>
                  {formatMoney(tc.totalBalance, tc.currencyCode)}
                </p>
                <p className="text-xs text-text-disabled mt-1">
                  {tc.accountCount} cuenta{tc.accountCount !== 1 ? "s" : ""}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Accounts table */}
      <Table
        columns={COLUMNS}
        data={accounts}
        isLoading={loadingAccounts}
        sortable
        emptyTitle="Sin cuentas"
        emptyDescription="Registra tu primera cuenta bancaria"
      />
    </div>
  );
}
