import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import useAuthStore from "@/store/auth.store";

function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await apiClient.get("/v1/auth/me");
      return res.data?.data ?? res.data;
    },
  });
}

export default function SettingsPage() {
  const storeUser = useAuthStore((s) => s.user);
  const { data: me, isLoading, isError } = useCurrentUser();

  const user = me ?? storeUser;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Configuración</h1>
        <p className="text-sm text-text-secondary mt-1">Perfil y datos de tu cuenta</p>
      </div>

      <div className="bg-surface border border-border rounded-lg divide-y divide-border">
        {/* Header */}
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-text-primary">Perfil de usuario</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {isLoading && (
            <p className="text-sm text-text-secondary">Cargando perfil...</p>
          )}
          {isError && (
            <p className="text-sm text-red-600">No se pudo cargar el perfil.</p>
          )}
          {user && (
            <dl className="space-y-4">
              <Field label="Correo electrónico" value={user.email} />
              <Field label="Nombre" value={user.displayName ?? "—"} />
              <Field label="ID de usuario" value={user.id ?? user.sub} mono />
              <Field
                label="Estado"
                value={
                  user.isActive === false
                    ? "Inactivo"
                    : user.isLocked
                    ? "Bloqueado"
                    : "Activo"
                }
              />
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-8">
      <dt className="w-40 shrink-0 text-sm text-text-secondary">{label}</dt>
      <dd
        className={[
          "text-sm text-text-primary",
          mono ? "font-mono text-xs" : "",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}
