import { apiClient } from '@/api/client';

export async function fetchCounterparties(params = {}) {
  const res = await apiClient.get('/v1/counterparties-lite', { params });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function fetchCounterparty(id) {
  const res = await apiClient.get(`/v1/counterparties-lite/${id}`);
  return res.data?.data ?? res.data;
}

export async function createCounterparty(data) {
  const res = await apiClient.post('/v1/counterparties-lite', data);
  return res.data?.data ?? res.data;
}

export async function updateCounterparty(id, data) {
  const res = await apiClient.patch(`/v1/counterparties-lite/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deleteCounterparty(id) {
  const res = await apiClient.delete(`/v1/counterparties-lite/${id}`);
  return res.data?.data ?? res.data;
}
