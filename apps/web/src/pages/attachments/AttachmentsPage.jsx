import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { usePermissions } from '@/hooks/usePermissions';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/i18n';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';

function useAttachments(organizationId) {
  return useQuery({
    queryKey: ['attachments', organizationId],
    queryFn: async () => {
      const res = await apiClient.get('/v1/attachments', { params: { organizationId } });
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : (payload?.items ?? []);
    },
    enabled: Boolean(organizationId),
  });
}

function useUploadAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const res = await apiClient.post('/v1/attachments/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments'] }),
  });
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

const matcher = (a, q) =>
  a.filename?.toLowerCase().includes(q) ||
  a.mimeType?.toLowerCase().includes(q) ||
  a.entityType?.toLowerCase().includes(q);

const COLUMNS = [
  {
    key: 'filename',
    header: 'Archivo',
    sortable: true,
    render: (r) => <span className="text-sm font-medium text-text-primary">{r.filename}</span>,
  },
  {
    key: 'mimeType',
    header: 'Tipo',
    render: (r) => (
      <span className="text-xs font-mono text-text-secondary">{r.mimeType ?? '—'}</span>
    ),
  },
  {
    key: 'sizeBytes',
    header: 'Tamaño',
    render: (r) => <span className="text-xs text-text-secondary">{formatBytes(r.sizeBytes)}</span>,
  },
  {
    key: 'entityType',
    header: 'Entidad',
    render: (r) => (
      <div className="flex flex-col">
        <span className="text-xs text-text-secondary">{r.entityType ?? '—'}</span>
        {r.entityId && (
          <span className="text-xs font-mono text-text-disabled truncate max-w-30">
            {r.entityId}
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'createdAt',
    header: 'Fecha',
    sortable: true,
    render: (r) => (
      <span className="text-xs text-text-secondary">
        {r.createdAt ? formatDate(r.createdAt) : '—'}
      </span>
    ),
  },
];

export default function AttachmentsPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const { data: attachments = [], isLoading, error } = useAttachments(organizationId);
  const uploadMutation = useUploadAttachment();
  const { query, setQuery, results } = useGlobalSearch(attachments, matcher);

  if (error) handleError(error);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadMutation.mutateAsync(file);
      toast.success(`"${file.name}" subido correctamente`);
    } catch (err) {
      handleError(err);
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Adjuntos"
        description="Archivos adjuntos de la organización"
        actions={
          isAdmin && (
            <>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
              <Button
                variant="primary"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Subiendo…' : 'Subir archivo'}
              </Button>
            </>
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
            placeholder="Buscar por nombre, tipo o entidad…"
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        sortable
        emptyTitle="Sin adjuntos"
        emptyDescription={
          query ? `Sin resultados para "${query}"` : 'Sube el primer archivo de la organización'
        }
      />
    </div>
  );
}
