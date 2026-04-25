import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchOrganization,
  fetchSettings,
  updateOrganization,
  updateSetting,
} from '../api/empresa.api';

export const EMPRESA_KEYS = {
  organization: (id) => ['organization', id],
  settings: (orgId) => ['empresa-settings', orgId],
};

export function useOrganization(organizationId) {
  return useQuery({
    queryKey: EMPRESA_KEYS.organization(organizationId),
    queryFn: () => fetchOrganization(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updateOrganization(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['organization', vars.id] });
    },
  });
}

export function useSettings(organizationId) {
  return useQuery({
    queryKey: EMPRESA_KEYS.settings(organizationId),
    queryFn: () => fetchSettings(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }) => updateSetting(id, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresa-settings'] });
    },
  });
}
