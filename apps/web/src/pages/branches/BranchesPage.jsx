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
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';

function useBranches(organizationId) {
  return useQuery({
    queryKey: ['branches', organizationId],
    queryFn: async () => {
      const res = await apiClient.get('/v1/branches', {
        params: { organizationId, includeInactive: true },
      });
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : (payload?.items ?? []);
    },
    enabled: Boolean(organizationId),
  });
}

function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/v1/branches', data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
}

function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`/v1/branches/${id}`, data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
}

function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/v1/branches/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
}

const BRANCH_EMPTY = { name: '' };

function BranchFormModal({ open, onClose, organizationId, initial }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState(initial ? { name: initial.name ?? '' } : BRANCH_EMPTY);
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es requerido';
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
      if (isEdit) {
        await updateMutation.mutateAsync({ id: initial.id, name: form.name.trim() });
        toast.success(`Sucursal "${form.name}" actualizada`);
      } else {
        await createMutation.mutateAsync({ organizationId, name: form.name.trim() });
        toast.success(`Sucursal "${form.name}" creada`);
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
      title={isEdit ? 'Editar sucursal' : 'Nueva sucursal'}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear sucursal'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre de la sucursal"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          placeholder="Ej. Sucursal Centro, Almacén Norte…"
        />
      </form>
    </Modal>
  );
}

const branchMatcher = (b, q) => b.name?.toLowerCase().includes(q);

export default function BranchesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();

  const { data: branches = [], isLoading, error } = useBranches(organizationId);
  const { query, setQuery, results } = useGlobalSearch(branches, branchMatcher);

  const deleteMutation = useDeleteBranch();
  const updateMutation = useUpdateBranch();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (error) handleError(error);

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(branch) {
    setEditTarget(branch);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
  }

  async function handleToggleActive(branch) {
    try {
      await updateMutation.mutateAsync({ id: branch.id, isActive: !branch.isActive });
      toast.success(branch.isActive ? 'Sucursal desactivada' : 'Sucursal activada');
    } catch (err) {
      handleError(err);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`Sucursal "${deleteTarget.name}" eliminada`);
    } catch (err) {
      handleError(err);
    } finally {
      setDeleteTarget(null);
    }
  }

  const COLUMNS = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      render: (b) => <span className="font-medium text-text-primary">{b.name}</span>,
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (b) =>
        b.isActive ? (
          <Badge variant="green" size="xs">
            Activa
          </Badge>
        ) : (
          <Badge variant="gray" size="xs">
            Inactiva
          </Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Creada',
      sortable: true,
      render: (b) => (
        <span className="text-xs text-text-secondary">
          {b.createdAt ? formatDate(b.createdAt) : '—'}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: '_actions',
            header: '',
            render: (b) => (
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
                <DropdownMenuItem onClick={() => openEdit(b)}>Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleActive(b)}>
                  {b.isActive ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(b)}>
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
        title="Sucursales"
        description="Unidades operativas de la organización"
        actions={
          isAdmin && (
            <Button variant="primary" size="sm" onClick={openCreate}>
              Nueva sucursal
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
            placeholder="Buscar por nombre…"
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin sucursales"
        emptyDescription={
          query
            ? `No se encontraron sucursales para "${query}"`
            : 'No hay sucursales registradas. Crea la primera.'
        }
      />

      <BranchFormModal
        open={formOpen}
        onClose={closeForm}
        organizationId={organizationId}
        initial={editTarget}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar sucursal"
        description={
          deleteTarget
            ? `¿Eliminar la sucursal "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : ''
        }
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
