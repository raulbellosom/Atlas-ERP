import { useEffect, useState } from 'react';
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
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useEmployees } from '@/modules/hr/hooks/useHr';

function useRoles(organizationId) {
  return useQuery({
    queryKey: ['roles', organizationId],
    queryFn: async () => {
      const res = await apiClient.get('/v1/roles', { params: { organizationId } });
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : (payload?.items ?? []);
    },
    enabled: Boolean(organizationId),
  });
}

function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      apiClient.post('/v1/users/invite', data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });
}

function useInvitations(organizationId) {
  return useQuery({
    queryKey: ['user-invitations', organizationId],
    queryFn: async () => {
      const res = await apiClient.get('/v1/users/invitations', { params: { organizationId } });
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : (payload?.items ?? []);
    },
    enabled: Boolean(organizationId),
  });
}

function useInvitationAction(action) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) =>
      apiClient.post(`/v1/users/invite/${id}/${action}`).then((r) => r.data?.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-invitations'] }),
  });
}

const INVITE_EMPTY = { email: '', displayName: '', roleId: '' };

function InviteUserModal({ open, onClose, organizationId }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const inviteMutation = useInviteUser();
  const { data: roles = [] } = useRoles(organizationId);
  const [form, setForm] = useState(INVITE_EMPTY);
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Requerido';
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
      await inviteMutation.mutateAsync({
        organizationId,
        email: form.email.trim(),
        displayName: form.displayName.trim() || undefined,
        roleId: form.roleId || undefined,
      });
      toast.success(`Invitacion enviada a "${form.email}"`);
      setForm(INVITE_EMPTY);
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invitar usuario"
      description="Se enviara un enlace por correo para activar su cuenta"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={inviteMutation.isPending}
          >
            {inviteMutation.isPending ? 'Invitando…' : 'Invitar'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Correo electrónico"
          type="email"
          required
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
        />
        <Input
          label="Nombre de display"
          value={form.displayName}
          onChange={(e) => set('displayName', e.target.value)}
        />

        {roleOptions.length > 0 && (
          <Select
            label="Rol"
            placeholder="Sin rol asignado"
            options={roleOptions}
            value={form.roleId}
            onValueChange={(v) => set('roleId', v)}
          />
        )}
      </form>
    </Modal>
  );
}

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

function InvitationStatusBadge({ invitation }) {
  if (invitation.status === 'ACCEPTED') {
    return (
      <Badge variant="green" size="xs">
        Aceptada
      </Badge>
    );
  }
  if (invitation.status === 'REVOKED') {
    return (
      <Badge variant="red" size="xs">
        Revocada
      </Badge>
    );
  }
  if (invitation.status === 'EXPIRED') {
    return (
      <Badge variant="amber" size="xs">
        Expirada
      </Badge>
    );
  }
  return (
    <Badge variant="blue" size="xs">
      Enviada
    </Badge>
  );
}

function useUpdateRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleIds }) =>
      apiClient.patch(`/v1/users/${id}/roles`, { roleIds }).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

function ManageRolesModal({ open, onClose, user, organizationId }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const updateRolesMutation = useUpdateRoles();
  const { data: roles = [] } = useRoles(organizationId);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  useEffect(() => {
    if (open && user) {
      setSelectedRoleIds(user.userRoles?.map((ur) => ur.role.id) || []);
    }
  }, [open, user]);

  const toggleRole = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  async function handleSubmit() {
    if (!user) return;
    try {
      await updateRolesMutation.mutateAsync({
        id: user.id,
        roleIds: selectedRoleIds,
      });
      toast.success('Roles actualizados correctamente');
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gestionar roles"
      description={`Roles asignados a ${user?.email}`}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={updateRolesMutation.isPending}
          >
            {updateRolesMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 max-h-64 overflow-y-auto p-1">
        {roles.length === 0 ? (
          <p className="text-sm text-text-disabled">No hay roles disponibles en la organización.</p>
        ) : (
          roles.map((role) => (
            <label
              key={role.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-surface-subtle transition-colors"
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-500 bg-surface-card"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{role.name}</p>
                {role.description && (
                  <p className="text-xs text-text-secondary mt-0.5">{role.description}</p>
                )}
              </div>
            </label>
          ))
        )}
      </div>
    </Modal>
  );
}

export default function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();

  const { data: users = [], isLoading, error } = useUsers(organizationId);
  const { data: invitations = [] } = useInvitations(organizationId);
  const { data: employees = [] } = useEmployees(organizationId);
  const { query, setQuery, results } = useGlobalSearch(users, userMatcher);
  const { page, setPage, pageSize, paginate, resetPage } = usePagination(25);

  useEffect(() => {
    resetPage();
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const employeeByUserId = Object.fromEntries(
    employees.filter((e) => e.userId).map((e) => [e.userId, e]),
  );

  const [actionTarget, setActionTarget] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [manageRolesUser, setManageRolesUser] = useState(null);

  const lockMutation = useUserAction('lock');
  const unlockMutation = useUserAction('unlock');
  const activateMutation = useUserAction('activate');
  const deactivateMutation = useUserAction('deactivate');
  const resendInvitationMutation = useInvitationAction('resend');
  const revokeInvitationMutation = useInvitationAction('revoke');

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

  async function handleResendInvitation(invitation) {
    try {
      await resendInvitationMutation.mutateAsync({ id: invitation.id });
      toast.success(`Invitacion reenviada a "${invitation.email}"`);
    } catch (err) {
      handleError(err);
    }
  }

  async function handleRevokeInvitation(invitation) {
    try {
      await revokeInvitationMutation.mutateAsync({ id: invitation.id });
      toast.success(`Invitacion revocada para "${invitation.email}"`);
    } catch (err) {
      handleError(err);
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
      key: '_hr',
      header: 'Perfil HR',
      render: (u) => {
        const emp = employeeByUserId[u.id];
        return emp ? (
          <Badge variant="violet" size="xs">
            {emp.firstName} {emp.lastName}
          </Badge>
        ) : (
          <span className="text-text-disabled text-xs">—</span>
        );
      },
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
      key: 'roles',
      header: 'Roles',
      render: (u) => {
        if (!u.userRoles || u.userRoles.length === 0) {
          return <span className="text-text-disabled text-xs">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {u.userRoles.map((ur) => (
              <Badge key={ur.role.id} variant="blue" size="xs">
                {ur.role.name}
              </Badge>
            ))}
          </div>
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
                  <DropdownMenuItem onClick={() => setManageRolesUser(u)}>
                    Gestionar roles
                  </DropdownMenuItem>
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

  const latestInvitations = invitations.slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Miembros con acceso a la plataforma"
        actions={
          isAdmin && (
            <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
              Invitar usuario
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
            placeholder="Buscar por correo o nombre…"
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-surface-subtle">
          <span className="label-caps text-[10px]">Invitaciones</span>
          <span className="text-xs text-text-secondary">{invitations.length} totales</span>
        </div>
        {latestInvitations.length === 0 ? (
          <p className="px-4 py-4 text-sm text-text-disabled">No hay invitaciones registradas.</p>
        ) : (
          <div className="divide-y divide-border">
            {latestInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm text-text-primary truncate">{invitation.email}</p>
                  <p className="text-xs text-text-secondary">
                    {invitation.lastSentAt
                      ? `Ultimo envio: ${formatDate(invitation.lastSentAt)}`
                      : 'Sin envio registrado'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <InvitationStatusBadge invitation={invitation} />
                  {isAdmin &&
                    invitation.status !== 'ACCEPTED' &&
                    invitation.status !== 'REVOKED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResendInvitation(invitation)}
                        disabled={resendInvitationMutation.isPending}
                      >
                        Reenviar
                      </Button>
                    )}
                  {isAdmin && invitation.status === 'PENDING' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvitation(invitation)}
                      disabled={revokeInvitationMutation.isPending}
                    >
                      Revocar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Table
        columns={COLUMNS}
        data={paginate(results)}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin usuarios"
        emptyDescription={
          query
            ? `No se encontraron usuarios para "${query}"`
            : 'No hay usuarios registrados en esta organización'
        }
      />

      <Pagination page={page} pageSize={pageSize} total={results.length} onPageChange={setPage} />

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        organizationId={organizationId}
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

      <ManageRolesModal
        open={Boolean(manageRolesUser)}
        onClose={() => setManageRolesUser(null)}
        user={manageRolesUser}
        organizationId={organizationId}
      />
    </div>
  );
}
