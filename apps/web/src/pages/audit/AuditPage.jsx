import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import useAuthStore from "@/store/auth.store";

function useAuditLogs({ organizationId, page, limit }) {
  return useQuery({
    queryKey: ["audit-logs", organizationId, page, limit],
    queryFn: async () => {
      const res = await apiClient.get("/v1/audit/logs", {
        params: { organizationId, page, limit },
      });
      return res.data?.data ?? res.data;
    },
    enabled: Boolean(organizationId),
    placeholderData: (prev) => prev,
  });
}

const PAGE_SIZE = 20;

export default function AuditPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAuditLogs({
    organizationId,
    page,
    limit: PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Auditoría</h1>
        <p className="text-sm text-text-secondary mt-1">
          Registro de acciones del sistema
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {isLoading && (
          <div className="px-6 py-8 text-sm text-text-secondary text-center">
            Cargando registros...
          </div>
        )}
        {isError && (
          <div className="px-6 py-8 text-sm text-red-600 text-center">
            No se pudieron cargar los registros de auditoría.
          </div>
        )}
        {!isLoading && !isError && (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-subtle">
                  <Th>Acción</Th>
                  <Th>Entidad</Th>
                  <Th>Actor</Th>
                  <Th>Resultado</Th>
                  <Th>Fecha</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-text-disabled">
                      Sin registros de auditoría.
                    </td>
                  </tr>
                )}
                {items.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-subtle transition-colors">
                    <Td>
                      <span className="font-mono text-xs text-brand-600">{log.action}</span>
                    </Td>
                    <Td>
                      <span className="text-text-secondary">{log.entityType}</span>
                      {log.entityId && (
                        <span className="block font-mono text-xs text-text-disabled truncate max-w-32">
                          {log.entityId}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-text-secondary truncate block max-w-32">
                        {log.actorId ?? "—"}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={[
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          log.result === "SUCCESS"
                            ? "bg-green-50 text-green-700"
                            : log.result
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-100 text-gray-600",
                        ].join(" ")}
                      >
                        {log.result ?? "—"}
                      </span>
                    </Td>
                    <Td>
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString("es")
                        : "—"}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-text-secondary">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
                </span>
                <div className="flex gap-2">
                  <PaginationBtn
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                  >
                    Anterior
                  </PaginationBtn>
                  <PaginationBtn
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    Siguiente
                  </PaginationBtn>
                </div>
              </div>
            )}
          </>
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

function PaginationBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1 text-xs border border-border rounded-md text-text-secondary hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
