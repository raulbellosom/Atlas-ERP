import { useState } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { usePermissions } from '@/hooks/usePermissions';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/i18n';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import AlertDialog from '@/components/ui/AlertDialog';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import {
  useEmployees,
  useTerminateEmployee,
  useDepartments,
  useUpdateEmployee,
} from '../hooks/useHr';
import EmployeeFormModal from './EmployeeFormModal';

function useUsers(organizationId) {
  return useQuery({
    queryKey: ['users', organizationId],
    queryFn: async () => {
      const res = await apiClient.get('/v1/users', { params: { organizationId } });
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : (payload?.items ?? []);
    },
    enabled: Boolean(organizationId),
  });
}

function LinkUserModal({ open, onClose, employee, organizationId }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const updateMutation = useUpdateEmployee();
  const { data: users = [] } = useUsers(organizationId);
  const [selectedUserId, setSelectedUserId] = useState('');

  const options = [
    { value: '__none__', label: '— Sin vincular —' },
    ...users.map((u) => ({
      value: u.id,
      label: u.email + (u.displayName ? ` (${u.displayName})` : ''),
    })),
  ];

  async function handleSave() {
    try {
      const userId = selectedUserId === '__none__' ? null : selectedUserId || null;
      await updateMutation.mutateAsync({ id: employee.id, userId });
      toast.success(userId ? 'Usuario vinculado correctamente' : 'Vínculo eliminado');
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vincular usuario de plataforma"
      description={`Empleado: ${employee?.firstName} ${employee?.lastName}`}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      }
    >
      <Select
        label="Usuario de plataforma"
        placeholder="Seleccionar usuario…"
        options={options}
        value={selectedUserId || (employee?.userId ?? '__none__')}
        onValueChange={setSelectedUserId}
      />
    </Modal>
  );
}

const STATUS_LABELS = {
  ACTIVE: 'Activo',
  ON_LEAVE: 'Con permiso',
  TERMINATED: 'Dado de baja',
  SUSPENDED: 'Suspendido',
};

const STATUS_VARIANTS = {
  ACTIVE: 'green',
  ON_LEAVE: 'yellow',
  TERMINATED: 'red',
  SUSPENDED: 'gray',
};

const employeeMatcher = (emp, q) =>
  `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
  emp.email?.toLowerCase().includes(q) ||
  emp.employeeCode?.toLowerCase().includes(q);

export default function EmployeesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();

  const { data: employees = [], isLoading, error: listError } = useEmployees(organizationId);
  const { data: departments = [] } = useDepartments(organizationId);
  const terminateMutation = useTerminateEmployee();

  const { query, setQuery, results } = useGlobalSearch(employees, employeeMatcher);

  const [formOpen, setFormOpen] = useState(false);
  const [terminateTarget, setTerminateTarget] = useState(null);
  const [linkTarget, setLinkTarget] = useState(null);

  if (listError) handleError(listError);

  const handleTerminate = async () => {
    if (!terminateTarget) return;
    try {
      await terminateMutation.mutateAsync({ id: terminateTarget.id, actorId: user?.id });
      toast.success(
        `Empleado "${terminateTarget.firstName} ${terminateTarget.lastName}" dado de baja`,
      );
    } catch (err) {
      handleError(err);
    } finally {
      setTerminateTarget(null);
    }
  };

  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

  const COLUMNS = [
    {
      key: 'name',
      header: 'Empleado',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">
            {row.firstName} {row.lastName}
          </span>
          <span className="text-xs text-text-secondary font-mono">{row.employeeCode}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Correo',
      render: (row) =>
        row.email ? (
          <span className="text-sm text-text-secondary">{row.email}</span>
        ) : (
          <span className="text-text-disabled">—</span>
        ),
    },
    {
      key: 'departmentId',
      header: 'Departamento',
      render: (row) => <span className="text-sm">{deptMap[row.departmentId] ?? '—'}</span>,
    },
    {
      key: 'hireDate',
      header: 'Ingreso',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.hireDate ? formatDate(row.hireDate) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => (
        <Badge variant={STATUS_VARIANTS[row.status] ?? 'gray'} size="xs">
          {STATUS_LABELS[row.status] ?? row.status}
        </Badge>
      ),
    },
    ...(isAdmin
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
                <DropdownMenuItem onClick={() => setLinkTarget(row)}>
                  {row.userId ? 'Cambiar usuario vinculado' : 'Vincular usuario de plataforma'}
                </DropdownMenuItem>
                {row.status !== 'TERMINATED' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setTerminateTarget(row)}>
                      Dar de baja
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenu>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empleados"
        description="Directorio de personal de la organización"
        actions={
          isAdmin && (
            <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
              Nuevo empleado
            </Button>
          )
        }
      />

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
            placeholder="Buscar por nombre, correo o código..."
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin empleados"
        emptyDescription={
          query
            ? `No se encontraron empleados para "${query}"`
            : 'Agrega el primer empleado de la organización'
        }
      />

      <EmployeeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        organizationId={organizationId}
        departments={departments}
      />

      <AlertDialog
        open={Boolean(terminateTarget)}
        onOpenChange={(open) => !open && setTerminateTarget(null)}
        title="Dar de baja al empleado"
        description={`¿Estás seguro de dar de baja a "${terminateTarget?.firstName} ${terminateTarget?.lastName}"? Esta acción no se puede deshacer.`}
        cancelLabel="Cancelar"
        confirmLabel="Dar de baja"
        onConfirm={handleTerminate}
        variant="destructive"
      />

      {linkTarget && (
        <LinkUserModal
          open={Boolean(linkTarget)}
          onClose={() => setLinkTarget(null)}
          employee={linkTarget}
          organizationId={organizationId}
        />
      )}
    </div>
  );
}
