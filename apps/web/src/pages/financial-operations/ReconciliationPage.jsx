import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { useReconciliationSessions } from "@/modules/financial-operations/hooks/useReconciliation";
import { formatDate } from "@/lib/i18n";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";

/**
 * ReconciliationPage — Listado de sesiones de conciliación.
 *
 * Cada sesión tiene un estado: OPEN, CLOSED, APPROVED.
 */

const statusVariants = {
  OPEN: "yellow",
  CLOSED: "blue",
  APPROVED: "green",
  REJECTED: "red",
};
const statusLabels = {
  OPEN: "Abierta",
  CLOSED: "Cerrada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export default function ReconciliationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const { data: sessions = [], isLoading, error } = useReconciliationSessions(organizationId);

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const COLUMNS = [
    {
      key: "id",
      header: "Sesión",
      render: (row) => (
        <Link
          to={`/financial-operations/reconciliation/${row.id}`}
          className="font-mono text-xs text-ink-700 hover:text-ink-900 hover:underline transition-colors"
        >
          {row.id?.slice(0, 8)}…
        </Link>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => (
        <Badge variant={statusVariants[row.status] ?? "gray"} size="xs">
          {statusLabels[row.status] ?? row.status}
        </Badge>
      ),
    },
    {
      key: "bankAccountName",
      header: "Cuenta",
      render: (row) => row.bankAccountName ?? row.bankAccountId?.slice(0, 8) ?? "—",
    },
    {
      key: "itemCount",
      header: "Items",
      render: (row) => (
        <span className="font-mono text-sm">{row.itemCount ?? "—"}</span>
      ),
    },
    {
      key: "reconciledCount",
      header: "Conciliados",
      render: (row) => (
        <span className="font-mono text-sm text-success">{row.reconciledCount ?? "—"}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Creada",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-text-secondary">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "_actions",
      header: "",
      render: (row) => (
        <button
          onClick={() => navigate(`/financial-operations/reconciliation/${row.id}`)}
          className="text-xs text-ink-600 hover:text-ink-800 font-medium"
        >
          {row.status === "OPEN" ? "Conciliar" : "Ver detalle"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conciliación"
        description="Sesiones de conciliación bancaria"
      />

      <Table
        columns={COLUMNS}
        data={sessions}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin sesiones de conciliación"
        emptyDescription="Las sesiones se crean automáticamente al importar estados de cuenta"
      />
    </div>
  );
}
