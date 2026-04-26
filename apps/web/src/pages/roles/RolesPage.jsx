import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { usePermissions } from '@/hooks/usePermissions';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useToast } from '@/components/ui/Toast';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import Pagination, { usePagination } from '@/components/ui/Pagination';

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

function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/v1/roles', data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`/v1/roles/${id}`, data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

const ROLE_EMPTY = { name: '', description: '', level: '' };

function RoleFormModal({ open, onClose, organizationId, initial }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name ?? '',
          description: initial.description ?? '',
          level: initial.level ?? '',
        }
      : ROLE_EMPTY,
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name ?? '',
              description: initial.description ?? '',
              level: initial.level ?? '',
            }
          : ROLE_EMPTY,
      );
      setErrors({});
    }
  }, [open, initial]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Requerido';
    if (form.level !== '' && (isNaN(Number(form.level)) || Number(form.level) < 1)) {
      errs.level = 'Debe ser un número mayor a 0';
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
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      level: form.level !== '' ? Number(form.level) : undefined,
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: initial.id, ...payload });
        toast.success(`Rol "${form.name}" actualizado`);
      } else {
        await createMutation.mutateAsync({ organizationId, ...payload });
        toast.success(`Rol "${form.name}" creado`);
      }
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar rol' : 'Nuevo rol'}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear rol'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
        />
        <Input
          label="Descripción"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <Input
          label="Nivel (número)"
          type="number"
          min="1"
          value={form.level}
          onChange={(e) => set('level', e.target.value)}
          error={errors.level}
          helpText="Define jerarquía dentro de la organización"
        />
      </form>
    </Modal>
  );
}

const roleMatcher = (r, q) =>
  r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);

export default function RolesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();

  const { data: roles = [], isLoading, error } = useRoles(organizationId);
  const { query, setQuery, results } = useGlobalSearch(roles, roleMatcher);
  const { page, setPage, pageSize, paginate, resetPage } = usePagination(25);

  useEffect(() => {
    resetPage();
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  if (error) handleError(error);

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }
  function openEdit(role) {
    setEditTarget(role);
    setFormOpen(true);
  }
  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
  }

  const COLUMNS = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      render: (r) => <span className="font-medium text-text-primary">{r.name}</span>,
    },
    {
      key: 'level',
      header: 'Nivel',
      sortable: true,
      render: (r) => <span className="font-mono text-xs text-text-secondary">{r.level ?? 0}</span>,
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (r) => <span className="text-sm text-text-secondary">{r.description ?? '—'}</span>,
    },
    {
      key: 'permissionCount',
      header: 'Permisos',
      render: (r) => (
        <span className="text-xs text-text-secondary font-mono">{r.permissionCount ?? 0}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (r) =>
        r.isActive !== false ? (
          <Badge variant="green" size="xs">
            Activo
          </Badge>
        ) : (
          <Badge variant="gray" size="xs">
            Inactivo
          </Badge>
        ),
    },
    ...(isAdmin
      ? [
          {
            key: '_actions',
            header: '',
            render: (r) => (
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
                <DropdownMenuItem onClick={() => openEdit(r)}>Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/roles/${r.id}/permissions`)}>
                  Gestionar permisos
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
        title="Roles"
        description="Roles y permisos de acceso de la organización"
        actions={
          isAdmin && (
            <Button variant="primary" size="sm" onClick={openCreate}>
              Nuevo rol
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
            placeholder="Buscar por nombre o descripción…"
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={paginate(results)}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin roles"
        emptyDescription={
          query ? `No se encontraron roles para "${query}"` : 'No hay roles configurados'
        }
      />

      <Pagination page={page} pageSize={pageSize} total={results.length} onPageChange={setPage} />

      <RoleFormModal
        open={formOpen}
        onClose={closeForm}
        organizationId={organizationId}
        initial={editTarget}
      />
    </div>
  );
}
