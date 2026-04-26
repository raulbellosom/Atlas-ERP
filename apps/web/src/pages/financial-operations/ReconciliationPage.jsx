import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import {
  useReconciliationSessions,
  useCreateReconciliationSession,
} from '@/modules/financial-operations/hooks/useReconciliation';
import { useBankAccounts } from '@/modules/financial-operations/hooks/useBankAccounts';
import { formatDate } from '@/lib/i18n';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';

/**
 * ReconciliationPage — Listado de sesiones de conciliación.
 *
 * Cada sesión tiene un estado: OPEN, CLOSED, CANCELED.
 * Ahora incluye un modal para crear nuevas sesiones.
 */

const statusVariants = {
  OPEN: 'yellow',
  CLOSED: 'blue',
  CANCELED: 'neutral',
};
const statusLabels = {
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
  CANCELED: 'Cancelada',
};

export default function ReconciliationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();

  const { data: sessions = [], isLoading, error } = useReconciliationSessions(organizationId);
  const { data: bankAccounts = [] } = useBankAccounts(organizationId);
  const createMutation = useCreateReconciliationSession();

  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({
    bankAccountId: '',
    notes: '',
  });

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const accountOptions = bankAccounts
    .filter((a) => a.isActive)
    .map((a) => ({
      value: a.id,
      label: `${a.name} — ${a.bankName}`,
    }));

  const handleCreateSession = async () => {
    if (!newSession.bankAccountId) {
      toast.error('Selecciona una cuenta bancaria');
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        organizationId,
        bankAccountId: newSession.bankAccountId,
        openedById: user?.id,
        status: 'OPEN',
        startedAt: new Date().toISOString(),
        notes: newSession.notes?.trim() || undefined,
      });
      toast.success('Sesión de conciliación creada');
      setShowForm(false);
      setNewSession({ bankAccountId: '', notes: '' });
      navigate(`/financial-operations/reconciliation/${created.id}`);
    } catch (err) {
      handleError(err);
    }
  };

  const COLUMNS = [
    {
      key: 'id',
      header: 'Sesión',
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
      key: 'status',
      header: 'Estado',
      render: (row) => (
        <Badge variant={statusVariants[row.status] ?? 'gray'} size="xs">
          {statusLabels[row.status] ?? row.status}
        </Badge>
      ),
    },
    {
      key: 'bankAccountName',
      header: 'Cuenta',
      render: (row) => row.bankAccountName ?? row.bankAccountId?.slice(0, 8) ?? '—',
    },
    {
      key: 'startedAt',
      header: 'Inicio',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {formatDate(row.startedAt ?? row.createdAt)}
        </span>
      ),
    },
    {
      key: 'closedAt',
      header: 'Cierre',
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.closedAt ? formatDate(row.closedAt) : '—'}
        </span>
      ),
    },
    {
      key: '_actions',
      header: '',
      render: (row) => (
        <button
          onClick={() => navigate(`/financial-operations/reconciliation/${row.id}`)}
          className="text-xs text-ink-600 hover:text-ink-800 font-medium"
        >
          {row.status === 'OPEN' ? 'Conciliar' : 'Ver detalle'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Conciliación" description="Sesiones de conciliación bancaria">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
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
          Nueva sesión
        </button>
      </PageHeader>

      {/* Formulario inline para crear sesión */}
      {showForm && (
        <Card>
          <div className="p-4 md:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">
              Nueva sesión de conciliación
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="Cuenta bancaria"
                placeholder="Selecciona cuenta..."
                options={accountOptions}
                value={newSession.bankAccountId}
                onValueChange={(val) => setNewSession((s) => ({ ...s, bankAccountId: val }))}
                required
              />
              <Textarea
                label="Notas"
                placeholder="Notas opcionales..."
                value={newSession.notes}
                onChange={(e) =>
                  setNewSession((s) => ({
                    ...s,
                    notes: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateSession}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear sesión'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Table
        columns={COLUMNS}
        data={sessions}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin sesiones de conciliación"
        emptyDescription="Crea una nueva sesión para comenzar a conciliar movimientos"
      />
    </div>
  );
}
