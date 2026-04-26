import { apiClient } from '@/api/client';

/**
 * API layer — Financial Movements.
 * Endpoints: v1/financial-movements
 * Permisos: finops:financial_movement:read / :write
 */

export async function fetchMovements(params = {}) {
  const res = await apiClient.get('/v1/financial-movements', { params });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function fetchMovementsByFilters(params = {}) {
  const res = await apiClient.get('/v1/financial-movements/by-filters', { params });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function fetchMovement(id) {
  const res = await apiClient.get(`/v1/financial-movements/${id}`);
  return res.data?.data ?? res.data;
}

export async function createMovement(data) {
  const res = await apiClient.post('/v1/financial-movements', data);
  return res.data?.data ?? res.data;
}

export async function updateMovement(id, data) {
  const res = await apiClient.patch(`/v1/financial-movements/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deleteMovement(id) {
  const res = await apiClient.delete(`/v1/financial-movements/${id}`);
  return res.data?.data ?? res.data;
}

export async function fetchMovementAttachments(movementId) {
  const res = await apiClient.get(`/v1/financial-movements/${movementId}/attachments`);
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

/**
 * Subir comprobante/adjunto a un movimiento.
 * @param {string} movementId
 * @param {File} file
 * @param {{ label?: string, note?: string, organizationId?: string }} meta
 */
export async function uploadMovementAttachment(movementId, file, meta = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (meta.label) formData.append('note', meta.label);
  if (meta.note) formData.append('note', meta.note);
  if (meta.organizationId) formData.append('organizationId', meta.organizationId);

  const res = await apiClient.post(
    `/v1/financial-movements/${movementId}/attachments/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data?.data ?? res.data;
}

export async function updateMovementAttachment(movementId, attachmentId, meta = {}) {
  const res = await apiClient.patch(
    `/v1/financial-movements/${movementId}/attachments/${attachmentId}`,
    meta,
  );
  return res.data?.data ?? res.data;
}

export async function deleteMovementAttachment(movementId, attachmentId) {
  const res = await apiClient.delete(
    `/v1/financial-movements/${movementId}/attachments/${attachmentId}`,
  );
  return res.data?.data ?? res.data;
}
