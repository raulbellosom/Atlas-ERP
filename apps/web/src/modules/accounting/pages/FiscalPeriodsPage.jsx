import { useState } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/i18n';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import AlertDialog from '@/components/ui/AlertDialog';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import {
  useFiscalPeriods,
  useCreateFiscalPeriod,
  useCloseFiscalPeriod,
} from '../hooks/useAccounting';

const MONTH_NAMES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const MONTH_OPTIONS = MONTH_NAMES.slice(1).map((label, i) => ({
  value: String(i + 1),
  label,
}));

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - 1 + i;
  return { value: String(y), label: String(y) };
});

const EMPTY_FORM = {
  year: String(currentYear),
  month: String(new Date().getMonth() + 1),
};

function FiscalPeriodFormModal({ open, onClose, organizationId }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const createMutation = useCreateFiscalPeriod();
  const [form, setForm] = useState(EMPTY_FORM);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        organizationId,
        year: Number(form.year),
        month: Number(form.month),
      });
      toast.success(`Período ${MONTH_NAMES[Number(form.month)]} ${form.year} creado`);
      setForm(EMPTY_FORM);
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nuevo período fiscal"
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="fp-form"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creando…' : 'Crear período'}
          </Button>
        </div>
      }
    >
      <form id="fp-form" onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Año"
          value={form.year}
          onValueChange={(v) => set('year', v)}
          options={YEAR_OPTIONS}
        />
        <Select
          label="Mes"
          value={form.month}
          onValueChange={(v) => set('month', v)}
          options={MONTH_OPTIONS}
        />
      </form>
    </Modal>
  );
}

export default function FiscalPeriodsPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();

  const { data: periods = [], isLoading, error } = useFiscalPeriods(organizationId);
  const closeMutation = useCloseFiscalPeriod();

  const [formOpen, setFormOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState(null);

  if (error) handleError(error);

  async function handleClose() {
    if (!closeTarget) return;
    try {
      await closeMutation.mutateAsync(closeTarget.id);
      toast.success(`Período ${MONTH_NAMES[closeTarget.month]} ${closeTarget.year} cerrado`);
    } catch (err) {
      handleError(err);
    } finally {
      setCloseTarget(null);
    }
  }

  const COLUMNS = [
    {
      key: 'year',
      header: 'Año',
      sortable: true,
      render: (row) => <span className="font-medium text-text-primary">{row.year}</span>,
    },
    {
      key: 'month',
      header: 'Mes',
      sortable: true,
      render: (row) => <span className="text-sm text-text-primary">{MONTH_NAMES[row.month]}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) =>
        row.status === 'OPEN' ? (
          <Badge variant="green" size="xs">
            Abierto
          </Badge>
        ) : (
          <Badge variant="gray" size="xs">
            Cerrado
          </Badge>
        ),
    },
    {
      key: 'closedAt',
      header: 'Cerrado el',
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.closedAt ? formatDate(row.closedAt) : '—'}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: '_actions',
            header: '',
            render: (row) =>
              row.status === 'OPEN' ? (
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
                  <DropdownMenuItem variant="destructive" onClick={() => setCloseTarget(row)}>
                    Cerrar período
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
        title="Períodos fiscales"
        description="Control de períodos contables de la organización"
        actions={
          isAdmin && (
            <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
              Nuevo período
            </Button>
          )
        }
      />

      <Table
        columns={COLUMNS}
        data={periods}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin períodos fiscales"
        emptyDescription="Crea el primer período fiscal para comenzar a registrar asientos contables"
      />

      <FiscalPeriodFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        organizationId={organizationId}
      />

      <AlertDialog
        open={Boolean(closeTarget)}
        onOpenChange={(open) => !open && setCloseTarget(null)}
        title="Cerrar período fiscal"
        description={`¿Confirmas cerrar el período ${MONTH_NAMES[closeTarget?.month]} ${closeTarget?.year}? Una vez cerrado no se podrán agregar más asientos a este período.`}
        cancelLabel="Cancelar"
        confirmLabel="Cerrar período"
        onConfirm={handleClose}
        variant="destructive"
      />
    </div>
  );
}
