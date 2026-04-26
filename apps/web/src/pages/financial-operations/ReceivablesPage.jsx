import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useReceivables,
  useDeleteReceivable,
} from '@/modules/financial-operations/hooks/useCxcCxp';
import { FINOPS_PERMISSIONS } from '@/modules/financial-operations/routes';
import { formatDate } from '@/lib/i18n';
import FinancialTable, {
  moneyRender,
} from '@/modules/financial-operations/components/FinancialTable';
import FinancialSummaryCard from '@/modules/financial-operations/components/FinancialSummaryCard';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import AlertDialog from '@/components/ui/AlertDialog';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { useToast } from '@/components/ui/Toast';

/**
 * ReceivablesPage — Cuentas por cobrar simples.
 */

const statusVariants = {
  OPEN: 'yellow',
  PARTIAL: 'blue',
  PAID: 'green',
  OVERDUE: 'red',
  VOIDED: 'gray',
};
const statusLabels = {
  OPEN: 'Abierto',
  PARTIAL: 'Parcial',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
  VOIDED: 'Anulado',
};

const matcher = (item, q) =>
  item.reference?.toLowerCase().includes(q) ||
  item.description?.toLowerCase().includes(q) ||
  item.externalReference?.toLowerCase().includes(q);

export default function ReceivablesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { hasAny, isAdmin } = usePermissions();
  const { toast } = useToast();
  const navigate = useNavigate();
  const canWrite = isAdmin || hasAny(FINOPS_PERMISSIONS.RECEIVABLE_WRITE);

  const { data: receivables = [], isLoading, error } = useReceivables(organizationId);
  const deleteMutation = useDeleteReceivable();
  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const { query, setQuery, results } = useGlobalSearch(receivables, matcher);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('CxC eliminada');
    } catch (err) {
      handleError(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Summaries
  const totalAmount = receivables.reduce((s, r) => s + parseFloat(r.amount ?? '0'), 0);
  const totalPaid = receivables.reduce((s, r) => s + parseFloat(r.amountPaid ?? '0'), 0);
  const pending = receivables.filter(
    (r) => r.status === 'OPEN' || r.status === 'PARTIAL' || r.status === 'OVERDUE',
  );

  const COLUMNS = [
    {
      key: 'reference',
      header: 'Referencia',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs">{r.reference || r.externalReference || '—'}</span>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (r) => (
        <span className="text-sm truncate max-w-[180px] block">{r.description || '—'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      sortable: true,
      render: moneyRender({ colorMode: 'income' }),
    },
    {
      key: 'amountPaid',
      header: 'Pagado',
      render: moneyRender({ amountKey: 'amountPaid', colorMode: 'income' }),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => (
        <Badge variant={statusVariants[r.status] ?? 'gray'} size="xs">
          {statusLabels[r.status] ?? r.status}
        </Badge>
      ),
    },
    {
      key: 'dueAt',
      header: 'Vence',
      sortable: true,
      render: (r) => (
        <span className="text-xs text-text-secondary">{r.dueAt ? formatDate(r.dueAt) : '—'}</span>
      ),
    },
    ...(canWrite
      ? [
          {
            key: '_actions',
            header: '',
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
                    >
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                }
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/financial-operations/receivables/${row.id}`);
                  }}
                >
                  Ver detalle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/financial-operations/receivables/${row.id}/edit`);
                  }}
                >
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(row);
                  }}
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
        title="Cuentas por cobrar"
        description="Gestión y seguimiento de cuentas por cobrar (CxC)"
      >
        {canWrite && (
          <button
            type="button"
            onClick={() => navigate('/financial-operations/receivables/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-meridian-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-meridian-700 transition-colors"
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva CxC
          </button>
        )}
      </PageHeader>

      {/* Panel de búsqueda */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-subtle">
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
          <span className="label-caps text-[10px]">Búsqueda</span>
        </div>
        <div className="p-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por referencia o descripción..."
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FinancialSummaryCard
          title="Total CxC"
          amount={String(totalAmount)}
          variant="income"
          subtitle={`${receivables.length} registros`}
        />
        <FinancialSummaryCard title="Total cobrado" amount={String(totalPaid)} variant="income" />
        <FinancialSummaryCard
          title="Pendientes"
          amount={String(totalAmount - totalPaid)}
          variant="expense"
          subtitle={`${pending.length} items`}
        />
      </div>

      <FinancialTable
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin cuentas por cobrar"
        emptyDescription="Registra tu primera CxC"
        onRowClick={(row) => navigate(`/financial-operations/receivables/${row.id}`)}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar CxC"
        description={`¿Eliminar "${deleteTarget?.reference ?? 'este registro'}"?`}
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
