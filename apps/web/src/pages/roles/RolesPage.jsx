import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import useAuthStore from "@/store/auth.store";

function useRoles(organizationId) {
  return useQuery({
    queryKey: ["roles", organizationId],
    queryFn: async () => {
      const res = await apiClient.get("/v1/roles", {
        params: { organizationId },
      });
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : (payload?.items ?? []);
    },
    enabled: Boolean(organizationId),
  });
}

export default function RolesPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;

  const { data: roles = [], isLoading, isError } = useRoles(organizationId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Roles</h1>
        <p className="text-sm text-text-secondary mt-1">
          Roles y permisos de la organización
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {isLoading && (
          <div className="px-6 py-8 text-sm text-text-secondary text-center">
            Cargando roles...
          </div>
        )}
        {isError && (
          <div className="px-6 py-8 text-sm text-red-600 text-center">
            No se pudieron cargar los roles.
          </div>
        )}
        {!isLoading && !isError && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-subtle">
                <Th>Nombre</Th>
                <Th>Nivel</Th>
                <Th>Descripción</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-text-disabled">
                    Sin roles registrados.
                  </td>
                </tr>
              )}
              {roles.map((r) => (
                <tr key={r.id} className="hover:bg-surface-subtle transition-colors">
                  <Td>
                    <span className="font-medium text-text-primary">{r.name}</span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-text-secondary">{r.level ?? 0}</span>
                  </Td>
                  <Td>{r.description ?? "—"}</Td>
                  <Td>
                    <span
                      className={[
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                        r.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      ].join(" ")}
                    >
                      {r.isActive ? "Activo" : "Inactivo"}
                    </span>
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
  return <td className="px-4 py-3 text-text-primary">{children}</td>;
}
