import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import useAuthStore from '@/store/auth.store';
import { useApiError } from '@/hooks/useApiError';
import { usePermissions } from '@/hooks/usePermissions';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import AttachmentList from '@/components/ui/AttachmentList';

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

function useUpdateAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiClient.patch(`/v1/attachments/${id}`, data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments'] }),
  });
}

function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/v1/attachments/${id}`);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments'] }),
  });
}

const matcher = (a, q) =>
  a.filename?.toLowerCase().includes(q) ||
  a.mimeType?.toLowerCase().includes(q) ||
  a.entityType?.toLowerCase().includes(q);

export default function AttachmentsPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const { data: attachments = [], isLoading, error } = useAttachments(organizationId);
  const uploadMutation = useUploadAttachment();
  const updateMutation = useUpdateAttachment();
  const deleteMutation = useDeleteAttachment();
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

  const handleRename = async (attachmentId, newName) => {
    try {
      await updateMutation.mutateAsync({ id: attachmentId, data: { filename: newName } });
      toast.success('Archivo renombrado');
    } catch (err) {
      handleError(err);
    }
  };

  const handleDelete = async (attachmentId) => {
    try {
      await deleteMutation.mutateAsync(attachmentId);
      toast.success('Archivo eliminado');
    } catch (err) {
      handleError(err);
    }
  };

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

      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
        {isLoading ? (
          <div className="flex justify-center p-8 text-text-secondary text-sm">Cargando...</div>
        ) : (
          <AttachmentList
            attachments={results}
            onRename={isAdmin ? handleRename : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
            readOnly={false}
          />
        )}
      </div>
    </div>
  );
}
