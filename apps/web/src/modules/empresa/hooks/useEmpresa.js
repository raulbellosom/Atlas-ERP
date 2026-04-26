import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  purgeOrganization,
  fetchAttachmentDownloadUrl,
  fetchOrganization,
  fetchSettings,
  updateOrganization,
  updateSetting,
  uploadLogo,
} from '../api/empresa.api';

export const EMPRESA_KEYS = {
  organization: (id) => ['organization', id],
  settings: (orgId) => ['empresa-settings', orgId],
  logoUrl: (attachmentId) => ['attachment-url', attachmentId],
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

export function usePurgeOrganization() {
  return useMutation({
    mutationFn: ({ id, password }) => purgeOrganization(id, password),
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

export function useLogoUrl(attachmentId) {
  return useQuery({
    queryKey: EMPRESA_KEYS.logoUrl(attachmentId),
    queryFn: () => fetchAttachmentDownloadUrl(attachmentId),
    enabled: Boolean(attachmentId),
    staleTime: 4 * 60 * 1000,
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadLogo,
    onSuccess: (attachment, vars) => {
      qc.invalidateQueries({ queryKey: ['organization', vars.organizationId] });
      qc.invalidateQueries({ queryKey: ['attachment-url', attachment.id] });
    },
  });
}
