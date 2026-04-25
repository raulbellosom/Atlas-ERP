import { apiClient } from '@/api/client';

export async function fetchProfile() {
  const res = await apiClient.get('/v1/users/me');
  return res.data?.data ?? res.data;
}

export async function updateProfile(data) {
  const res = await apiClient.patch('/v1/users/me', data);
  return res.data?.data ?? res.data;
}

export async function uploadAvatar({ organizationId, userId, file }) {
  const form = new FormData();
  form.append('file', file);
  form.append('organizationId', organizationId);
  form.append('entityType', 'user');
  form.append('entityId', userId);
  form.append('uploadedById', userId);
  const res = await apiClient.post('/v1/attachments/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data ?? res.data;
}

export async function fetchAvatarUrl(attachmentId) {
  const res = await apiClient.get(`/v1/attachments/${attachmentId}/download`);
  const payload = res.data?.data ?? res.data;
  return payload?.downloadUrl ?? null;
}
