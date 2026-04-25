import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { formatDate } from '@/lib/i18n';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';

const PAGE_SIZE = 20;

const RESULT_VARIANTS = {
  SUCCESS: 'green',
  FAILURE: 'red',
  ERROR: 'red',
  WARNING: 'yellow',
};

function useAuditLogs(organizationId, page) {
  return useQuery({
    queryKey: ['audit-logs', organizationId, page],
    queryFn: async () => {
      const res = await apiClient.get('/v1/audit/logs', {
        params: { organizationId, page, limit: PAGE_SIZE },
      });
      return res.data?.data ?? res.data;
    },
    enabled: Boolean(organizationId),
    placeholderData: (prev) => prev,
  });
}

const COLUMNS = [
  {
    key: 'action',
    header: 'Acción',
    render: (r) => <span className="text-xs font-mono text-brand-600">{r.action}</span>,
  },
  {
    key: 'entityType',
    header: 'Entidad',
    render: (r) => (
      <div className="flex flex-col">
        <span className="text-sm text-text-secondary">{r.entityType ?? '—'}</span>
        {r.entityId && (
          <span className="text-xs font-mono text-text-disabled truncate max-w-30">
            {r.entityId}
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'actorId',
    header: 'Actor',
    render: (r) => (
      <span className="text-xs font-mono text-text-secondary truncate block max-w-30">
        {r.actorId ?? '—'}
      </span>
    ),
  },
  {
    key: 'result',
    header: 'Resultado',
    render: (r) =>
      r.result ? (
        <Badge variant={RESULT_VARIANTS[r.result] ?? 'gray'} size="xs">
          {r.result}
        </Badge>
      ) : (
        <span className="text-text-disabled text-xs">—</span>
      ),
  },
  {
    key: 'createdAt',
    header: 'Fecha',
    render: (r) => (
      <span className="text-xs text-text-secondary">
        {r.createdAt ? formatDate(r.createdAt) : '—'}
      </span>
    ),
  },
];

export default function AuditPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useAuditLogs(organizationId, page);

  if (error) handleError(error);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const filtered = search
    ? items.filter(
        (l) =>
          l.action?.toLowerCase().includes(search.toLowerCase()) ||
          l.entityType?.toLowerCase().includes(search.toLowerCase()) ||
          l.actorId?.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  return (
    <div className="space-y-6">
      <PageHeader title="Auditoría" description="Registro de acciones del sistema" />

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
            value={search}
            onChange={setSearch}
            placeholder="Buscar por acción, entidad o actor…"
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={filtered}
        isLoading={isLoading}
        emptyTitle="Sin registros"
        emptyDescription="No hay eventos de auditoría para este período"
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Página {page} de {totalPages} ({total} registros)
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
