import { useState } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/i18n';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import AlertDialog from '@/components/ui/AlertDialog';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { useSessions, useRevokeSession } from '../hooks/useInstancia';

const STATUS_VARIANTS = {
  ACTIVE: 'green',
  EXPIRED: 'gray',
  REVOKED: 'red',
};

const COLUMNS = [
  {
    key: 'userId',
    header: 'Usuario',
    render: (r) => (
      <span className="text-xs font-mono text-text-secondary truncate block max-w-30">
        {r.userId ?? '—'}
      </span>
    ),
  },
  {
    key: 'ipAddress',
    header: 'IP',
    render: (r) => (
      <span className="text-xs font-mono text-text-secondary">{r.ipAddress ?? '—'}</span>
    ),
  },
  {
    key: 'userAgent',
    header: 'Dispositivo',
    render: (r) => (
      <span className="text-xs text-text-secondary truncate block max-w-40">
        {r.userAgent ?? '—'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (r) => (
      <Badge variant={STATUS_VARIANTS[r.status] ?? 'gray'} size="xs">
        {r.status ?? '—'}
      </Badge>
    ),
  },
  {
    key: 'createdAt',
    header: 'Iniciada',
    render: (r) => (
      <span className="text-xs text-text-secondary">
        {r.createdAt ? formatDate(r.createdAt) : '—'}
      </span>
    ),
  },
];

export default function InstanciaSessionsPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { toast } = useToast();
  const [revokeTarget, setRevokeTarget] = useState(null);

  const { data: sessions = [], isLoading, error } = useSessions(organizationId);
  const revokeMutation = useRevokeSession();

  if (error) handleError(error);

  const columns = [
    ...COLUMNS,
    {
      key: '_actions',
      header: '',
      render: (r) => {
        if (r.status !== 'ACTIVE') return null;
        return (
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
            <DropdownMenuItem variant="destructive" onClick={() => setRevokeTarget(r)}>
              Revocar sesión
            </DropdownMenuItem>
          </DropdownMenu>
        );
      },
    },
  ];

  async function handleRevoke() {
    if (!revokeTarget) return;
    try {
      await revokeMutation.mutateAsync(revokeTarget.id);
      toast.success('Sesión revocada');
    } catch (err) {
      handleError(err);
    } finally {
      setRevokeTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sesiones" description="Sesiones activas en la instancia" />

      <Table
        columns={columns}
        data={sessions}
        isLoading={isLoading}
        emptyTitle="Sin sesiones"
        emptyDescription="No hay sesiones registradas"
      />

      <AlertDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revocar sesión"
        description={`¿Revocar la sesión de ${revokeTarget?.userId ?? 'este usuario'}? El usuario perderá acceso inmediatamente.`}
        cancelLabel="Cancelar"
        confirmLabel="Revocar"
        onConfirm={handleRevoke}
        variant="destructive"
      />
    </div>
  );
}
