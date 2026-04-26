import { useState } from 'react';
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
import { useDepartments, useCreateDepartment } from '../hooks/useHr';

const deptMatcher = (d, q) =>
  d.name?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);

function DepartmentFormModal({ open, onClose, organizationId }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const createMutation = useCreateDepartment();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setNameError('Requerido'); return; }
    try {
      await createMutation.mutateAsync({ organizationId, name: name.trim(), description: description.trim() || undefined, isActive: true });
      toast.success(`Departamento "${name}" creado`);
      setName(''); setDescription(''); setNameError('');
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  function handleClose() {
    setName(''); setDescription(''); setNameError('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nuevo departamento"
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose} type="button">Cancelar</Button>
          <Button variant="primary" size="sm" type="submit" form="dept-form" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      }
    >
      <form id="dept-form" onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre" value={name} onChange={(e) => { setName(e.target.value); setNameError(''); }} error={nameError} required />
        <Input label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
      </form>
    </Modal>
  );
}

export default function DepartmentsPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();

  const { data: departments = [], isLoading, error } = useDepartments(organizationId);
  const { query, setQuery, results } = useGlobalSearch(departments, deptMatcher);
  const [formOpen, setFormOpen] = useState(false);

  if (error) handleError(error);

  const COLUMNS = [
    { key: 'name', header: 'Nombre', sortable: true, render: (row) => <span className="font-medium text-text-primary">{row.name}</span> },
    { key: 'description', header: 'Descripción', render: (row) => <span className="text-sm text-text-secondary">{row.description ?? '—'}</span> },
    {
      key: 'isActive',
      header: 'Estado',
      render: (row) =>
        row.isActive !== false ? (
          <Badge variant="green" size="xs">Activo</Badge>
        ) : (
          <Badge variant="gray" size="xs">Inactivo</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departamentos"
        description="Estructura organizacional de la empresa"
        actions={
          isAdmin && (
            <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
              Nuevo departamento
            </Button>
          )
        }
      />

      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-subtle">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-amber-500 shrink-0" aria-hidden="true">
            <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="label-caps text-[10px]">Búsqueda</span>
        </div>
        <div className="p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar departamento…" className="w-full sm:w-80" />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin departamentos"
        emptyDescription={query ? `No se encontraron resultados para "${query}"` : 'Crea el primer departamento de la organización'}
      />

      <DepartmentFormModal open={formOpen} onClose={() => setFormOpen(false)} organizationId={organizationId} />
    </div>
  );
}
