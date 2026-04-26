import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useCounterparties,
  useDeleteCounterparty,
} from '@/modules/financial-operations/hooks/useCounterparties';
import { FINOPS_PERMISSIONS } from '@/modules/financial-operations/routes';
import FinancialTable from '@/modules/financial-operations/components/FinancialTable';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import AlertDialog from '@/components/ui/AlertDialog';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { useToast } from '@/components/ui/Toast';

const statusVariants = { ACTIVE: 'green', INACTIVE: 'gray', SUSPENDED: 'red' };
const typeLabels = {
  CUSTOMER: 'Cliente',
  VENDOR: 'Proveedor',
  EMPLOYEE: 'Empleado',
  OTHER: 'Otro',
};

const matcher = (item, q) =>
  item.name?.toLowerCase().includes(q) ||
  item.displayName?.toLowerCase().includes(q) ||
  item.taxId?.toLowerCase().includes(q);

export default function CounterpartiesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { hasAny, isAdmin } = usePermissions();
  const { toast } = useToast();
  const navigate = useNavigate();
  const canWrite = isAdmin || hasAny(FINOPS_PERMISSIONS.RECEIVABLE_WRITE); // Compartiendo permisos con CxC/CxP

  const { data: counterparties = [], isLoading, error } = useCounterparties(organizationId);
  const deleteMutation = useDeleteCounterparty();
  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const { query, setQuery, results } = useGlobalSearch(counterparties, matcher);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Contraparte eliminada');
    } catch (err) {
      handleError(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const COLUMNS = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      render: (r) => (
        <span className="font-medium text-text-primary">{r.displayName || r.name}</span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      sortable: true,
      render: (r) => (
        <span className="text-sm text-text-secondary">{typeLabels[r.type] ?? r.type}</span>
      ),
    },
    {
      key: 'taxId',
      header: 'RFC / ID Fiscal',
      sortable: true,
      render: (r) => <span className="font-mono text-xs">{r.taxId || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => (
        <Badge variant={statusVariants[r.status] ?? 'gray'} size="xs">
          {r.status}
        </Badge>
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
                  onClick={() => navigate(`/financial-operations/counterparties/${row.id}/edit`)}
                >
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row)}>
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
        title="Contrapartes"
        description="Directorio de clientes, proveedores y empleados"
      >
        {canWrite && (
          <button
            type="button"
            onClick={() => navigate('/financial-operations/counterparties/new')}
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
            Nueva Contraparte
          </button>
        )}
      </PageHeader>

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
            placeholder="Buscar por nombre, RFC..."
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <FinancialTable
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin contrapartes"
        emptyDescription="Agrega tu primer cliente o proveedor"
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar Contraparte"
        description={`¿Eliminar a "${deleteTarget?.name ?? 'este registro'}"?`}
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
