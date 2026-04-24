import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
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

function useUserAction(action) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => {
      if (action === 'deactivate') return apiClient.delete(`/v1/users/${id}/deactivate`);
      return apiClient.post(`/v1/users/${id}/${action}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

const userMatcher = (u, q) =>
  u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q);

const ACTION_LABELS = {
  lock: 'Bloquear',
  unlock: 'Desbloquear',
  activate: 'Activar',
  deactivate: 'Desactivar',
};

const ACTION_CONFIRM_MSGS = {
  lock: (u) => `¿Bloquear al usuario "${u.email}"? No podrá iniciar sesión hasta ser desbloqueado.`,
  unlock: (u) => `¿Desbloquear al usuario "${u.email}"?`,
  activate: (u) => `¿Activar al usuario "${u.email}"?`,
  deactivate: (u) => `¿Desactivar al usuario "${u.email}"? Perderá acceso a la plataforma.`,
};

export default function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();

  const { data: users = [], isLoading, error } = useUsers(organizationId);
  const { query, setQuery, results } = useGlobalSearch(users, userMatcher);

  const [actionTarget, setActionTarget] = useState(null);

  const lockMutation = useUserAction('lock');
  const unlockMutation = useUserAction('unlock');
  const activateMutation = useUserAction('activate');
  const deactivateMutation = useUserAction('deactivate');

  const mutationMap = {
    lock: lockMutation,
    unlock: unlockMutation,
    activate: activateMutation,
    deactivate: deactivateMutation,
  };

  if (error) handleError(error);

  async function handleConfirm() {
    if (!actionTarget) return;
    const { action, targetUser } = actionTarget;
    try {
      await mutationMap[action].mutateAsync({ id: targetUser.id });
      toast.success(`Usuario ${ACTION_LABELS[action].toLowerCase()}do correctamente`);
    } catch (err) {
      handleError(err);
    } finally {
      setActionTarget(null);
    }
  }

  const COLUMNS = [
    {
      key: 'email',
      header: 'Correo',
      sortable: true,
      render: (u) => <span className="text-sm text-text-primary">{u.email}</span>,
    },
    {
      key: 'displayName',
      header: 'Nombre',
      render: (u) => <span className="text-sm text-text-secondary">{u.displayName ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (u) => {
        if (u.isLocked)
          return (
            <Badge variant="red" size="xs">
              Bloqueado
            </Badge>
          );
        if (!u.isActive)
          return (
            <Badge variant="gray" size="xs">
              Inactivo
            </Badge>
          );
        return (
          <Badge variant="green" size="xs">
            Activo
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Registrado',
      sortable: true,
      render: (u) => (
        <span className="text-xs text-text-secondary">
          {u.createdAt ? formatDate(u.createdAt) : '—'}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: '_actions',
            header: '',
            render: (u) => {
              if (u.id === user?.id) return null;
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
                  {u.isActive && !u.isLocked && (
                    <DropdownMenuItem
                      onClick={() => setActionTarget({ action: 'lock', targetUser: u })}
                    >
                      Bloquear
                    </DropdownMenuItem>
                  )}
                  {u.isLocked && (
                    <DropdownMenuItem
                      onClick={() => setActionTarget({ action: 'unlock', targetUser: u })}
                    >
                      Desbloquear
                    </DropdownMenuItem>
                  )}
                  {!u.isActive && (
                    <DropdownMenuItem
                      onClick={() => setActionTarget({ action: 'activate', targetUser: u })}
                    >
                      Activar
                    </DropdownMenuItem>
                  )}
                  {u.isActive && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setActionTarget({ action: 'deactivate', targetUser: u })}
                      >
                        Desactivar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenu>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Usuarios" description="Miembros con acceso a la plataforma" />

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
            placeholder="Buscar por correo o nombre…"
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin usuarios"
        emptyDescription={
          query
            ? `No se encontraron usuarios para "${query}"`
            : 'No hay usuarios registrados en esta organización'
        }
      />

      <AlertDialog
        open={Boolean(actionTarget)}
        onOpenChange={(open) => !open && setActionTarget(null)}
        title={actionTarget ? ACTION_LABELS[actionTarget.action] : ''}
        description={
          actionTarget ? ACTION_CONFIRM_MSGS[actionTarget.action]?.(actionTarget.targetUser) : ''
        }
        cancelLabel="Cancelar"
        confirmLabel={actionTarget ? ACTION_LABELS[actionTarget.action] : ''}
        onConfirm={handleConfirm}
        variant={
          actionTarget?.action === 'lock' || actionTarget?.action === 'deactivate'
            ? 'destructive'
            : 'default'
        }
      />
    </div>
  );
}
