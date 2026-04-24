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
import Select from '@/components/ui/Select';
import { useChartOfAccounts, useCreateChartOfAccount } from '../hooks/useAccounting';

const ACCOUNT_TYPE_LABELS = {
  ASSET: 'Activo',
  LIABILITY: 'Pasivo',
  EQUITY: 'Capital',
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
};

const ACCOUNT_TYPE_VARIANTS = {
  ASSET: 'blue',
  LIABILITY: 'red',
  EQUITY: 'violet',
  INCOME: 'green',
  EXPENSE: 'yellow',
};

const ACCOUNT_TYPE_OPTIONS = Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const EMPTY_FORM = {
  code: '',
  name: '',
  accountType: 'ASSET',
  parentId: '',
};

const coaMatcher = (a, q) =>
  a.code?.toLowerCase().includes(q) ||
  a.name?.toLowerCase().includes(q) ||
  ACCOUNT_TYPE_LABELS[a.accountType]?.toLowerCase().includes(q);

function ChartOfAccountFormModal({ open, onClose, organizationId, accounts }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const createMutation = useCreateChartOfAccount();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Requerido';
    if (!form.name.trim()) errs.name = 'Requerido';
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
        code: form.code.trim(),
        name: form.name.trim(),
        accountType: form.accountType,
        parentId: form.parentId || undefined,
        isActive: true,
      });
      toast.success(`Cuenta "${form.code} – ${form.name}" creada`);
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

  const parentOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.code} – ${a.name}`,
  }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nueva cuenta contable"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="coa-form"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      }
    >
      <form id="coa-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Código"
            value={form.code}
            onChange={(e) => set('code', e.target.value)}
            error={errors.code}
            placeholder="1000"
            required
          />
          <Select
            label="Tipo de cuenta"
            value={form.accountType}
            onValueChange={(v) => set('accountType', v)}
            options={ACCOUNT_TYPE_OPTIONS}
          />
        </div>
        <Input
          label="Nombre"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          placeholder="Caja y bancos"
          required
        />
        {parentOptions.length > 0 && (
          <Select
            label="Cuenta padre"
            value={form.parentId}
            onValueChange={(v) => set('parentId', v)}
            options={parentOptions}
            placeholder="Sin cuenta padre"
          />
        )}
      </form>
    </Modal>
  );
}

export default function ChartOfAccountsPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();

  const { data: accounts = [], isLoading, error } = useChartOfAccounts(organizationId);
  const { query, setQuery, results } = useGlobalSearch(accounts, coaMatcher);
  const [formOpen, setFormOpen] = useState(false);

  if (error) handleError(error);

  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  const COLUMNS = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-sm font-medium text-text-primary">{row.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm text-text-primary">{row.name}</span>
          {row.parentId && accountMap[row.parentId] && (
            <span className="text-xs text-text-disabled font-mono">
              {accountMap[row.parentId].code} – {accountMap[row.parentId].name}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'accountType',
      header: 'Tipo',
      render: (row) => (
        <Badge variant={ACCOUNT_TYPE_VARIANTS[row.accountType] ?? 'gray'} size="xs">
          {ACCOUNT_TYPE_LABELS[row.accountType] ?? row.accountType}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (row) =>
        row.isActive !== false ? (
          <Badge variant="green" size="xs">
            Activa
          </Badge>
        ) : (
          <Badge variant="gray" size="xs">
            Inactiva
          </Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan de cuentas"
        description="Catálogo de cuentas contables de la organización"
        actions={
          isAdmin && (
            <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
              Nueva cuenta
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
            placeholder="Buscar por código, nombre o tipo…"
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin cuentas contables"
        emptyDescription={
          query
            ? `No se encontraron resultados para "${query}"`
            : 'Crea la primera cuenta del plan contable'
        }
      />

      <ChartOfAccountFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        organizationId={organizationId}
        accounts={accounts}
      />
    </div>
  );
}
