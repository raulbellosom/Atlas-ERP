import { apiClient } from '@/api/client';

export async function fetchHealth() {
  const res = await apiClient.get('/health');
  return res.data;
}

export async function fetchFeatureFlags() {
  const res = await apiClient.get('/v1/feature-flags', { params: { includeInactive: true } });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function toggleFeatureFlag(key) {
  const res = await apiClient.patch(`/v1/feature-flags/${key}/toggle`);
  return res.data?.data ?? res.data;
}

export async function fetchSessions(organizationId) {
  const res = await apiClient.get('/v1/sessions', { params: { organizationId } });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function revokeSession(id) {
  const res = await apiClient.delete(`/v1/sessions/${id}`);
  return res.data?.data ?? res.data;
}

export async function fetchEmailOutboundConfig() {
  const res = await apiClient.get('/v1/settings/email-outbound');
  return res.data?.data ?? res.data;
}

export async function updateEmailOutboundConfig(payload) {
  const res = await apiClient.put('/v1/settings/email-outbound', payload);
  return res.data?.data ?? res.data;
}

export async function testEmailOutbound(payload) {
  const res = await apiClient.post('/v1/settings/email-outbound/test', payload ?? {});
  return res.data?.data ?? res.data;
}
