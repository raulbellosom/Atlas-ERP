import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';

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

const roleMatcher = (r, q) =>
  r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);

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
];

export default function RolesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const { data: roles = [], isLoading, error } = useRoles(organizationId);
  const { query, setQuery, results } = useGlobalSearch(roles, roleMatcher);

  if (error) handleError(error);

  return (
    <div className="space-y-6">
      <PageHeader title="Roles" description="Roles y permisos de acceso de la organización" />

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
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin roles"
        emptyDescription={
          query ? `No se encontraron roles para "${query}"` : 'No hay roles configurados'
        }
      />
    </div>
  );
}
