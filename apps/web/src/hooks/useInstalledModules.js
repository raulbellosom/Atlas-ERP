import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/store/auth.store';
import { fetchInstalledModules } from '@/modules/module-store/api/module-store.api';

export const INSTALLED_MODULES_QUERY_KEY = ['module-store', 'installed'];

export function useInstalledModules() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading, isError } = useQuery({
    queryKey: INSTALLED_MODULES_QUERY_KEY,
    queryFn: fetchInstalledModules,
    enabled: isAuthenticated,
    staleTime: 60_000,
    select: (rows) =>
      new Set(
        Array.isArray(rows)
          ? rows.filter((r) => r?.status === 'INSTALLED').map((r) => r.moduleKey)
          : [],
      ),
  });

  return { installedModules: data ?? new Set(), isLoading, isError };
}
