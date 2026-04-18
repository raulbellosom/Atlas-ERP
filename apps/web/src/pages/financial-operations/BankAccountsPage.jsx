import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { usePermissions } from "@/hooks/usePermissions";
import { useBankAccounts, useDeleteBankAccount } from "@/modules/financial-operations/hooks/useBankAccounts";
import { FINOPS_PERMISSIONS } from "@/modules/financial-operations/routes";
import { formatDate } from "@/lib/i18n";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import AlertDialog from "@/components/ui/AlertDialog";
import { useToast } from "@/components/ui/Toast";

/**
 * BankAccountsPage — Listado de cuentas bancarias.
 *
 * Features:
 * - Tabla sortable con columnas: nombre, banco, cuenta, moneda, saldo, estado, fecha
 * - Búsqueda por nombre o banco
 * - Acciones por fila: ver detalle, editar, eliminar (con AlertDialog de confirmación)
 * - Botón "Nueva cuenta" protegido por permisos
 * - Montos en font-mono con color income/expense
 * - Badge de estado activo/inactivo
 */

const accountMatcher = (account, q) =>
  account.name?.toLowerCase().includes(q) ||
  account.bankName?.toLowerCase().includes(q) ||
  account.accountNumberMask?.toLowerCase().includes(q);

export default function BankAccountsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { hasAny, isAdmin } = usePermissions();
  const { toast } = useToast();

  const canWrite = isAdmin || hasAny(FINOPS_PERMISSIONS.BANK_ACCOUNT_WRITE);

  const { data: accounts = [], isLoading, error } = useBankAccounts(organizationId);
  const deleteMutation = useDeleteBankAccount();

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const { query, setQuery, results } = useGlobalSearch(accounts, accountMatcher);

  // ── AlertDialog state ──
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`Cuenta "${deleteTarget.name}" eliminada`);
    } catch (err) {
      handleError(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Columns ──
  const COLUMNS = [
    {
      key: "name",
      header: "Nombre",
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
      key: "accountNumberMask",
      header: "Cuenta",
      render: (row) => (
        <span className="font-mono text-xs text-text-secondary">
          {row.accountNumberMask}
        </span>
      ),
    },
    {
      key: "currencyCode",
      header: "Moneda",
      render: (row) => (
        <Badge variant="blue" size="xs">
          {row.currencyCode ?? "MXN"}
        </Badge>
      ),
    },
    {
      key: "currentBalance",
      header: "Saldo",
      sortable: true,
      render: (row) => {
        const balance = parseFloat(row.currentBalance ?? "0");
        return (
          <span
            className={[
              "font-mono text-sm tabular-nums",
              balance >= 0 ? "text-success" : "text-error",
            ].join(" ")}
          >
            {new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: row.currencyCode ?? "MXN",
              minimumFractionDigits: 2,
            }).format(balance)}
          </span>
        );
      },
    },
    {
      key: "isActive",
      header: "Estado",
      render: (row) =>
        row.isActive ? (
          <Badge variant="green" size="xs">Activa</Badge>
        ) : (
          <Badge variant="gray" size="xs">Inactiva</Badge>
        ),
    },
    {
      key: "createdAt",
      header: "Creada",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.createdAt ? formatDate(row.createdAt) : "—"}
        </span>
      ),
    },
    // Acciones
    ...(canWrite
      ? [
          {
            key: "_actions",
            header: "",
            render: (row) => (
              <DropdownMenu
                trigger={
                  <button
                    className="p-1.5 rounded-md text-text-disabled hover:text-text-primary hover:bg-surface-subtle transition-colors"
                    aria-label="Acciones"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                }
              >
                <DropdownMenuItem
                  onClick={() => navigate(`/financial-operations/bank-accounts/${row.id}`)}
                >
                  Ver detalle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/financial-operations/bank-accounts/${row.id}/edit`)}
                >
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget(row)}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenu>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas bancarias"
        description="Gestiona las cuentas financieras de la organización"
        actions={
          canWrite && (
            <Button
              as={Link}
              to="/financial-operations/bank-accounts/new"
              variant="primary"
              size="sm"
            >
              Nueva cuenta
            </Button>
          )
        }
      />

      {/* Panel de búsqueda */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-subtle">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-amber-500 shrink-0" aria-hidden="true">
            <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="label-caps text-[10px]">Búsqueda</span>
        </div>
        <div className="p-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, banco o número de cuenta..."
            className="w-full sm:w-80"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin cuentas bancarias"
        emptyDescription={
          query
            ? `No se encontraron cuentas para "${query}"`
            : "Crea tu primera cuenta bancaria para comenzar a operar"
        }
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar cuenta bancaria"
        description={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
