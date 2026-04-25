import { apiClient } from '@/api/client';

export async function fetchOrganization(id) {
  const res = await apiClient.get(`/v1/organizations/${id}`);
  return res.data?.data ?? res.data;
}

export async function updateOrganization(id, data) {
  const res = await apiClient.patch(`/v1/organizations/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function fetchSettings(organizationId) {
  const res = await apiClient.get('/v1/settings', {
    params: { organizationId, includeGlobal: false },
  });
  const items = res.data?.data ?? res.data;
  return Array.isArray(items) ? items : (items?.items ?? []);
}

export async function updateSetting(id, value) {
  const res = await apiClient.patch(`/v1/settings/${id}`, { value });
  return res.data?.data ?? res.data;
}
