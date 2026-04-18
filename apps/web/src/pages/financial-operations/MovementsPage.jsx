import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "@/store/auth.store";
import { useApiError } from "@/hooks/useApiError";
import { usePermissions } from "@/hooks/usePermissions";
import { useMovements, useDeleteMovement } from "@/modules/financial-operations/hooks/useMovements";
import { useBankAccounts } from "@/modules/financial-operations/hooks/useBankAccounts";
import { FINOPS_PERMISSIONS } from "@/modules/financial-operations/routes";
import { formatDate } from "@/lib/i18n";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import AlertDialog from "@/components/ui/AlertDialog";
import { useToast } from "@/components/ui/Toast";

/**
 * MovementsPage — Listado de movimientos financieros con filtros avanzados.
 *
 * Filtros (T-1406):
 * - Cuenta bancaria (select)
 * - Tipo: INCOME / EXPENSE / ADJUSTMENT / TRANSFER_IN / TRANSFER_OUT
 * - Estado: PENDING / CONFIRMED / POSTED / VOIDED
 * - Rango de fechas: from / to
 */

const MOVEMENT_TYPES = [
  { value: "all", label: "Todos los tipos" },
  { value: "INCOME", label: "Ingreso" },
  { value: "EXPENSE", label: "Egreso" },
  { value: "ADJUSTMENT", label: "Ajuste" },
  { value: "TRANSFER_IN", label: "Entrada (Transferencia)" },
  { value: "TRANSFER_OUT", label: "Salida (Transferencia)" },
];

const MOVEMENT_STATUSES = [
  { value: "all", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "POSTED", label: "Contabilizado" },
  { value: "VOIDED", label: "Anulado" },
];

// Variantes de Badge correctas — Meridian Design System
const typeVariants = {
  INCOME:       "success",
  EXPENSE:      "error",
  ADJUSTMENT:   "info",
  TRANSFER_IN:  "success",
  TRANSFER_OUT: "error",
};

const typeLabels = {
  INCOME:       "Ingreso",
  EXPENSE:      "Egreso",
  ADJUSTMENT:   "Ajuste",
  TRANSFER_IN:  "Transferencia (Entrada)",
  TRANSFER_OUT: "Transferencia (Salida)",
};

const statusVariants = {
  PENDING:   "warning",
  CONFIRMED: "success",
  POSTED:    "primary",
  VOIDED:    "neutral",
};

const statusLabels = {
  PENDING:   "Pendiente",
  CONFIRMED: "Confirmado",
  POSTED:    "Contabilizado",
  VOIDED:    "Anulado",
};

function formatMoney(amount, currency = "MXN") {
  const val = parseFloat(amount ?? "0");
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(val);
}

export default function MovementsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { hasAny, isAdmin } = usePermissions();
  const { toast } = useToast();

  const canWrite = isAdmin || hasAny(FINOPS_PERMISSIONS.MOVEMENT_WRITE);

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    bankAccountId: searchParams.get("bankAccountId") ?? "all",
    movementType:  "all",
    status:        "all",
    from:          "",
    to:            "",
  });

  const updateFilter = (key) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const apiFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== "all"),
  );

  const { data: movements = [], isLoading, error } = useMovements(organizationId, apiFilters);
  const { data: bankAccounts = [] } = useBankAccounts(organizationId);
  const deleteMutation = useDeleteMovement();

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Movimiento eliminado");
    } catch (err) {
      handleError(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const accountOptions = [
    { value: "all", label: "Todas las cuentas" },
    ...bankAccounts.map((a) => ({ value: a.id, label: `${a.name} (${a.bankName})` })),
  ];

  const COLUMNS = [
    {
      key: "occurredAt",
      header: "Fecha",
      sortable: true,
      width: "110px",
      render: (row) => (
        <span className="text-xs text-text-secondary whitespace-nowrap font-mono">
          {row.occurredAt ? formatDate(row.occurredAt) : "—"}
        </span>
      ),
    },
    {
      key: "movementType",
      header: "Tipo",
      width: "180px",
      render: (row) => (
        <Badge variant={typeVariants[row.movementType] ?? "neutral"} size="xs" dot>
          {typeLabels[row.movementType] ?? row.movementType}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      sortable: true,
      align: "right",
      width: "140px",
      render: (row) => {
        const isIncome =
          row.movementType === "INCOME" || row.movementType === "TRANSFER_IN";
        return (
          <span
            className={[
              "font-mono text-sm tabular-nums font-medium",
              isIncome ? "text-success" : "text-error",
            ].join(" ")}
          >
            {isIncome ? "+" : "−"}{formatMoney(row.amount, row.currencyCode)}
          </span>
        );
      },
    },
    {
      key: "description",
      header: "Descripción",
      render: (row) => (
        <span className="text-sm text-text-primary truncate max-w-[200px] block">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "reference",
      header: "Referencia",
      render: (row) => (
        <span className="font-mono text-xs text-ink-400">
          {row.reference || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      width: "130px",
      render: (row) => (
        <Badge variant={statusVariants[row.status] ?? "neutral"} size="xs">
          {statusLabels[row.status] ?? row.status}
        </Badge>
      ),
    },
    ...(canWrite
      ? [
          {
            key: "_actions",
            header: "",
            width: "48px",
            render: (row) => (
              <DropdownMenu
                trigger={
                  <button
                    className="p-1.5 rounded-md text-text-disabled hover:text-text-primary hover:bg-surface-subtle transition-colors"
                    aria-label="Acciones"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                }
              >
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/financial-operations/movements/${row.id}`)
                  }
                >
                  Ver detalle
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
      {/* ── Encabezado de página ─────────────────────────────────────────────── */}
      <PageHeader
        title="Movimientos"
        description="Registro de ingresos, egresos y ajustes financieros"
        actions={
          canWrite && (
            <>
              <Button
                as={Link}
                to="/financial-operations/transfers/new"
                variant="secondary"
                size="sm"
              >
                Transferencia
              </Button>
              <Button
                as={Link}
                to="/financial-operations/movements/new"
                variant="primary"
                size="sm"
              >
                Nuevo movimiento
              </Button>
            </>
          )
        }
      />

      {/* ── Panel de filtros cartográfico ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        {/* Barra de título del panel */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-subtle">
          {/* Icono de filtro — aguja de navegación */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-amber-500 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M1 3h12M3 7h8M5 11h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="label-caps text-[10px]">Filtros</span>
        </div>
        {/* Grid de controles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 p-4">
          <Select
            label="Cuenta"
            options={accountOptions}
            value={filters.bankAccountId}
            onValueChange={updateFilter("bankAccountId")}
          />
          <Select
            label="Tipo"
            options={MOVEMENT_TYPES}
            value={filters.movementType}
            onValueChange={updateFilter("movementType")}
          />
          <Select
            label="Estado"
            options={MOVEMENT_STATUSES}
            value={filters.status}
            onValueChange={updateFilter("status")}
          />
          <Input
            label="Desde"
            type="date"
            value={filters.from}
            onChange={updateFilter("from")}
          />
          <Input
            label="Hasta"
            type="date"
            value={filters.to}
            onChange={updateFilter("to")}
          />
        </div>
      </div>

      {/* ── Tabla de movimientos ──────────────────────────────────────────────── */}
      <Table
        columns={COLUMNS}
        data={movements}
        isLoading={isLoading}
        emptyTitle="Sin movimientos registrados"
        emptyDescription="Registra tu primer movimiento financiero para comenzar a cartografiar el territorio."
        onRowClick={(row) =>
          navigate(`/financial-operations/movements/${row.id}`)
        }
      />

      {/* ── Confirmación de eliminación ───────────────────────────────────────── */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar movimiento"
        description={`¿Eliminar movimiento de ${formatMoney(deleteTarget?.amount, deleteTarget?.currencyCode)}? Esta acción no se puede deshacer.`}
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
