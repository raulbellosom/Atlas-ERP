import { apiClient } from '@/api/client';

/**
 * API layer — Reconciliation.
 * Endpoints: v1/reconciliation
 */

export async function fetchReconciliationSessions(params = {}) {
  const res = await apiClient.get('/v1/reconciliation/sessions', { params });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function createReconciliationSession(data) {
  const res = await apiClient.post('/v1/reconciliation/sessions', data);
  return res.data?.data ?? res.data;
}

export async function fetchReconciliationSession(id) {
  const res = await apiClient.get(`/v1/reconciliation/sessions/${id}`);
  return res.data?.data ?? res.data;
}

export async function fetchReconciliationItems(sessionId, params = {}) {
  const res = await apiClient.get(`/v1/reconciliation/sessions/${sessionId}/items`, { params });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function reconcileSession(sessionId, data) {
  const res = await apiClient.post(`/v1/reconciliation/sessions/${sessionId}/reconcile`, data);
  return res.data?.data ?? res.data;
}

export async function closeSession(sessionId, data = {}) {
  const res = await apiClient.post(`/v1/reconciliation/sessions/${sessionId}/close`, data);
  return res.data?.data ?? res.data;
}

export async function approveSession(sessionId, data = {}) {
  const res = await apiClient.post(`/v1/reconciliation/sessions/${sessionId}/approve`, data);
  return res.data?.data ?? res.data;
}
