import { apiClient } from '@/api/client';

export async function fetchOrganization(id) {
  const res = await apiClient.get(`/v1/organizations/${id}`);
  return res.data?.data ?? res.data;
}

export async function updateOrganization(id, data) {
  const res = await apiClient.patch(`/v1/organizations/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function purgeOrganization(id, password) {
  await apiClient.delete(`/v1/organizations/${id}/purge`, { data: { password } });
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

export async function uploadLogo({ organizationId, userId, file }) {
  const form = new FormData();
  form.append('file', file);
  form.append('organizationId', organizationId);
  form.append('entityType', 'organization');
  form.append('entityId', organizationId);
  if (userId) form.append('uploadedById', userId);
  const res = await apiClient.post('/v1/attachments/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data ?? res.data;
}

export async function fetchAttachmentDownloadUrl(attachmentId) {
  const res = await apiClient.get(`/v1/attachments/${attachmentId}/download`);
  const payload = res.data?.data ?? res.data;
  return payload?.downloadUrl ?? null;
}
