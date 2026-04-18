import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import useAuthStore from "@/store/auth.store";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import SearchInput from "@/components/ui/SearchInput";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useApiError } from "@/hooks/useApiError";
import { formatDate } from "@/lib/i18n";

function useUsers(organizationId) {
  return useQuery({
    queryKey: ["users", organizationId],
    queryFn: async () => {
      const res = await apiClient.get("/v1/users", {
        params: { organizationId },
      });
      const payload = res.data?.data ?? res.data;
      return Array.isArray(payload) ? payload : (payload?.items ?? []);
    },
    enabled: Boolean(organizationId),
  });
}

const userMatcher = (user, q) =>
  user.email?.toLowerCase().includes(q) ||
  user.displayName?.toLowerCase().includes(q);

const COLUMNS = [
  { key: "email", header: "Correo" },
  { key: "displayName", header: "Nombre", render: (u) => u.displayName ?? "—" },
  {
    key: "status",
    header: "Estado",
    render: (u) => {
      if (u.isLocked) return <Badge variant="red">Bloqueado</Badge>;
      if (!u.isActive) return <Badge variant="gray">Inactivo</Badge>;
      return <Badge variant="green">Activo</Badge>;
    },
  },
  {
    key: "createdAt",
    header: "Creado",
    render: (u) => (u.createdAt ? formatDate(u.createdAt) : "—"),
  },
];

export default function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;
  const { handleError } = useApiError();

  const { data: users = [], isLoading, error } = useUsers(organizationId);

  // Mostrar toast si hay error de API (render-safe)
  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const { query, setQuery, results } = useGlobalSearch(users, userMatcher);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Usuarios</h1>
          <p className="text-sm text-text-secondary mt-1">
            Usuarios de la organización
          </p>
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por email o nombre..."
          className="w-72"
        />
      </div>

      <Table
        columns={COLUMNS}
        data={results}
        isLoading={isLoading}
        emptyTitle="Sin usuarios"
        emptyDescription={
          query ? `No se encontraron usuarios para "${query}"` : undefined
        }
      />
    </div>
  );
}
