import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moduleStoreApi } from '../api/moduleStore.api.js';
import { addModuleVersion, setModuleLifecycle } from '../api/module-store.api.js';

export function useModuleCatalog(params = {}) {
  return useQuery({
    queryKey: ['module-store', 'catalog', params],
    queryFn: () => moduleStoreApi.getCatalog(params),
    staleTime: 60_000,
  });
}

export function useInstalledModules(organizationId) {
  return useQuery({
    queryKey: ['module-store', 'installed', organizationId],
    queryFn: () => moduleStoreApi.getInstalled(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 30_000,
  });
}

export function useInstallModule(organizationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => moduleStoreApi.install(payload, organizationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-store', 'installed', organizationId] });
    },
  });
}

export function useUninstallModule(organizationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => moduleStoreApi.uninstall(payload, organizationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-store', 'installed', organizationId] });
    },
  });
}

export function useUpgradeModule(organizationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => moduleStoreApi.upgrade(payload, organizationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-store', 'installed', organizationId] });
    },
  });
}

export function useSetLifecycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleKey, lifecycleState }) =>
      setModuleLifecycle(moduleKey, { lifecycleState }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-store-catalog'] });
    },
  });
}

export function useAddVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleKey, ...payload }) => addModuleVersion(moduleKey, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-store-catalog'] });
    },
  });
}
