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
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import {
  useLeaveRequests,
  useCreateLeaveRequest,
  useReviewLeaveRequest,
  useEmployees,
} from '../hooks/useHr';

const LEAVE_TYPE_LABELS = {
  VACATION: 'Vacaciones',
  SICK: 'Enfermedad',
  PERSONAL: 'Personal',
  MATERNITY: 'Maternidad',
  PATERNITY: 'Paternidad',
  UNPAID: 'Sin goce',
  OTHER: 'Otro',
};

const LEAVE_TYPE_OPTIONS = Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
};

const STATUS_VARIANTS = {
  PENDING: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray',
};

const EMPTY_FORM = {
  employeeId: '',
  type: 'VACATION',
  startDate: '',
  endDate: '',
  reason: '',
};

const leaveMatcher = (leave, q) =>
  leave.employee?.firstName?.toLowerCase().includes(q) ||
  leave.employee?.lastName?.toLowerCase().includes(q) ||
  leave.employee?.employeeCode?.toLowerCase().includes(q) ||
  LEAVE_TYPE_LABELS[leave.type]?.toLowerCase().includes(q);

function LeaveFormModal({ open, onClose, organizationId, employees }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const createMutation = useCreateLeaveRequest();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.employeeId) errs.employeeId = 'Requerido';
    if (!form.startDate) errs.startDate = 'Requerido';
    if (!form.endDate) errs.endDate = 'Requerido';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errs.endDate = 'La fecha fin debe ser posterior al inicio';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      await createMutation.mutateAsync({
        organizationId,
        employeeId: form.employeeId,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim() || undefined,
      });
      toast.success('Solicitud de ausencia registrada');
      setForm(EMPTY_FORM);
      setErrors({});
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }

  const empOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
  }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nueva solicitud de ausencia"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="leave-form"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      }
    >
      <form id="leave-form" onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Empleado"
          value={form.employeeId}
          onValueChange={(v) => set('employeeId', v)}
          options={empOptions}
          placeholder="Seleccionar empleado"
          error={errors.employeeId}
        />
        <Select
          label="Tipo de ausencia"
          value={form.type}
          onValueChange={(v) => set('type', v)}
          options={LEAVE_TYPE_OPTIONS}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha inicio"
            type="date"
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            error={errors.startDate}
            required
          />
          <Input
            label="Fecha fin"
            type="date"
            value={form.endDate}
            onChange={(e) => set('endDate', e.target.value)}
            error={errors.endDate}
            required
          />
        </div>
        <Input
          label="Motivo"
          value={form.reason}
          onChange={(e) => set('reason', e.target.value)}
          placeholder="Opcional"
        />
      </form>
    </Modal>
  );
}

export default function LeavesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();

  const { data: leaves = [], isLoading, error } = useLeaveRequests(organizationId);
  const { data: employees = [] } = useEmployees(organizationId);
  const reviewMutation = useReviewLeaveRequest();

  const { query, setQuery, results } = useGlobalSearch(leaves, leaveMatcher);

  const [formOpen, setFormOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  if (error) handleError(error);

  async function handleReview(status) {
    if (!reviewTarget) return;
    try {
      await reviewMutation.mutateAsync({ id: reviewTarget.id, reviewedById: user?.id, status });
      const label = status === 'APPROVED' ? 'aprobada' : 'rechazada';
      toast.success(`Solicitud ${label}`);
    } catch (err) {
      handleError(err);
    } finally {
      setReviewTarget(null);
    }
  }

  const COLUMNS = [
    {
      key: 'employee',
      header: 'Empleado',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">
            {row.employee?.firstName} {row.employee?.lastName}
          </span>
          <span className="text-xs text-text-secondary font-mono">
            {row.employee?.employeeCode}
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (row) => <span className="text-sm">{LEAVE_TYPE_LABELS[row.type] ?? row.type}</span>,
    },
    {
      key: 'startDate',
      header: 'Inicio',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.startDate ? formatDate(row.startDate) : '—'}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: 'Fin',
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.endDate ? formatDate(row.endDate) : '—'}
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
            render: (row) =>
              row.status === 'PENDING' ? (
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
                  <DropdownMenuItem onClick={() => setReviewTarget({ ...row, action: 'APPROVED' })}>
                    Aprobar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setReviewTarget({ ...row, action: 'REJECTED' })}
                  >
                    Rechazar
                  </DropdownMenuItem>
                </DropdownMenu>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ausencias"
        description="Solicitudes de tiempo libre y permisos del personal"
        actions={
          isAdmin && (
            <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
              Nueva solicitud
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
            placeholder="Buscar por empleado o tipo…"
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin solicitudes"
        emptyDescription={
          query
            ? `No se encontraron resultados para "${query}"`
            : 'Registra la primera solicitud de ausencia'
        }
      />

      <LeaveFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        organizationId={organizationId}
        employees={employees}
      />

      <AlertDialog
        open={Boolean(reviewTarget)}
        onOpenChange={(open) => !open && setReviewTarget(null)}
        title={reviewTarget?.action === 'APPROVED' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
        description={
          reviewTarget?.action === 'APPROVED'
            ? `¿Confirmas aprobar la solicitud de ${reviewTarget?.employee?.firstName} ${reviewTarget?.employee?.lastName}?`
            : `¿Confirmas rechazar la solicitud de ${reviewTarget?.employee?.firstName} ${reviewTarget?.employee?.lastName}?`
        }
        cancelLabel="Cancelar"
        confirmLabel={reviewTarget?.action === 'APPROVED' ? 'Aprobar' : 'Rechazar'}
        onConfirm={() => handleReview(reviewTarget?.action)}
        variant={reviewTarget?.action === 'APPROVED' ? 'default' : 'destructive'}
      />
    </div>
  );
}
