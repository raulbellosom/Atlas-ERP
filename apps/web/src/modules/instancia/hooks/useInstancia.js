import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchFeatureFlags,
  fetchHealth,
  fetchEmailOutboundConfig,
  fetchSessions,
  revokeSession,
  testEmailOutbound,
  toggleFeatureFlag,
  updateEmailOutboundConfig,
} from '../api/instancia.api';

export function useHealth() {
  return useQuery({
    queryKey: ['instancia-health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
  });
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlags,
  });
}

export function useToggleFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key) => toggleFeatureFlag(key),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feature-flags'] }),
  });
}

export function useSessions(organizationId) {
  return useQuery({
    queryKey: ['sessions', organizationId],
    queryFn: () => fetchSessions(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => revokeSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}

export function useEmailOutboundConfig() {
  return useQuery({
    queryKey: ['email-outbound-config'],
    queryFn: fetchEmailOutboundConfig,
  });
}

export function useUpdateEmailOutboundConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateEmailOutboundConfig(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-outbound-config'] }),
  });
}

export function useTestEmailOutbound() {
  return useMutation({
    mutationFn: (payload) => testEmailOutbound(payload),
  });
}
