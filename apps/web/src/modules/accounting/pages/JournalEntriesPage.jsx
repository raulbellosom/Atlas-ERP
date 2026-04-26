import { useState } from 'react';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { formatDate } from '@/lib/i18n';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import Select from '@/components/ui/Select';
import { useJournalEntries } from '../hooks/useAccounting';

const STATUS_LABELS = {
  DRAFT: 'Borrador',
  POSTED: 'Publicado',
  REVERSED: 'Revertido',
};

const STATUS_VARIANTS = {
  DRAFT: 'yellow',
  POSTED: 'green',
  REVERSED: 'gray',
};

const ALL_MONTHS_VALUE = 'ALL_MONTHS';
const ALL_YEARS_VALUE = 'ALL_YEARS';

const MONTH_OPTIONS = [
  { value: ALL_MONTHS_VALUE, label: 'Todos los meses' },
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: ALL_YEARS_VALUE, label: 'Todos los años' },
  ...Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  }),
];

const entryMatcher = (entry, q) =>
  entry.description?.toLowerCase().includes(q) ||
  entry.idempotencyKey?.toLowerCase().includes(q) ||
  STATUS_LABELS[entry.status]?.toLowerCase().includes(q);

export default function JournalEntriesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const [yearFilter, setYearFilter] = useState(ALL_YEARS_VALUE);
  const [monthFilter, setMonthFilter] = useState(ALL_MONTHS_VALUE);

  const filters = {
    ...(yearFilter !== ALL_YEARS_VALUE ? { year: Number(yearFilter) } : {}),
    ...(monthFilter !== ALL_MONTHS_VALUE ? { month: Number(monthFilter) } : {}),
  };

  const { data: entries = [], isLoading, error } = useJournalEntries(organizationId, filters);
  const { query, setQuery, results } = useGlobalSearch(entries, entryMatcher);
  const hasActiveFilters =
    Boolean(query) || yearFilter !== ALL_YEARS_VALUE || monthFilter !== ALL_MONTHS_VALUE;

  if (error) handleError(error);

  const COLUMNS = [
    {
      key: 'createdAt',
      header: 'Fecha',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.postedAt ? formatDate(row.postedAt) : formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm text-text-primary">
            {row.description ?? <span className="text-text-disabled italic">Sin descripción</span>}
          </span>
          <span className="text-xs text-text-disabled font-mono">{row.idempotencyKey}</span>
        </div>
      ),
    },
    {
      key: 'lines',
      header: 'Líneas',
      render: (row) => (
        <span className="text-sm text-text-secondary">{row.lines?.length ?? 0}</span>
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asientos contables"
        description="Registro de movimientos del libro diario"
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
          <span className="label-caps text-[10px]">Filtros</span>
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar asiento…"
            className="w-full sm:w-64"
          />
          <Select
            value={yearFilter}
            onValueChange={setYearFilter}
            options={YEAR_OPTIONS}
            placeholder="Año"
            className="w-36"
          />
          <Select
            value={monthFilter}
            onValueChange={setMonthFilter}
            options={MONTH_OPTIONS}
            placeholder="Mes"
            className="w-44"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin asientos"
        emptyDescription={
          hasActiveFilters
            ? 'No se encontraron asientos con los filtros aplicados'
            : 'Los asientos se generan automáticamente al registrar operaciones financieras'
        }
      />
    </div>
  );
}
