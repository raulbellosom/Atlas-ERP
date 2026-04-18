import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import useAuthStore from "@/store/auth.store";

function useAttachments(organizationId) {
  return useQuery({
    queryKey: ["attachments", organizationId],
    queryFn: async () => {
      const res = await apiClient.get("/v1/attachments", {
        params: { organizationId },
      });
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : (payload?.items ?? []);
    },
    enabled: Boolean(organizationId),
  });
}

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;

  const { data: attachments = [], isLoading, isError } = useAttachments(organizationId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Adjuntos</h1>
        <p className="text-sm text-text-secondary mt-1">
          Archivos adjuntos de la organización
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {isLoading && (
          <div className="px-6 py-8 text-sm text-text-secondary text-center">
            Cargando adjuntos...
          </div>
        )}
        {isError && (
          <div className="px-6 py-8 text-sm text-red-600 text-center">
            No se pudieron cargar los adjuntos.
          </div>
        )}
        {!isLoading && !isError && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-subtle">
                <Th>Nombre</Th>
                <Th>Tipo</Th>
                <Th>Tamaño</Th>
                <Th>Entidad</Th>
                <Th>Fecha</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attachments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-disabled">
                    Sin adjuntos registrados.
                  </td>
                </tr>
              )}
              {attachments.map((a) => (
                <tr key={a.id} className="hover:bg-surface-subtle transition-colors">
                  <Td>
                    <span className="font-medium text-text-primary">{a.filename}</span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-text-secondary">{a.mimeType}</span>
                  </Td>
                  <Td>{formatBytes(a.sizeBytes)}</Td>
                  <Td>
                    <span className="text-text-secondary">{a.entityType}</span>
                    {a.entityId && (
                      <span className="block font-mono text-xs text-text-disabled truncate max-w-28">
                        {a.entityId}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleDateString("es")
                      : "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-4 py-3">{children}</td>;
}
