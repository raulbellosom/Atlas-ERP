import { apiClient } from "@/api/client";

/** API — Receivables Lite (CxC). Endpoint: v1/receivables-lite */

export async function fetchReceivables(params = {}) {
  const res = await apiClient.get("/v1/receivables-lite", { params });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function fetchReceivable(id) {
  const res = await apiClient.get(`/v1/receivables-lite/${id}`);
  return res.data?.data ?? res.data;
}

export async function fetchOverdueReceivablesCount(organizationId) {
  const res = await apiClient.get(`/v1/receivables-lite/organization/${organizationId}/overdue-count`);
  return res.data?.data ?? res.data;
}

export async function createReceivable(data) {
  const res = await apiClient.post("/v1/receivables-lite", data);
  return res.data?.data ?? res.data;
}

export async function updateReceivable(id, data) {
  const res = await apiClient.patch(`/v1/receivables-lite/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deleteReceivable(id) {
  const res = await apiClient.delete(`/v1/receivables-lite/${id}`);
  return res.data?.data ?? res.data;
}

/** API — Payables Lite (CxP). Endpoint: v1/payables-lite */

export async function fetchPayables(params = {}) {
  const res = await apiClient.get("/v1/payables-lite", { params });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function fetchPayable(id) {
  const res = await apiClient.get(`/v1/payables-lite/${id}`);
  return res.data?.data ?? res.data;
}

export async function fetchOverduePayablesCount(organizationId) {
  const res = await apiClient.get(`/v1/payables-lite/organization/${organizationId}/overdue-count`);
  return res.data?.data ?? res.data;
}

export async function createPayable(data) {
  const res = await apiClient.post("/v1/payables-lite", data);
  return res.data?.data ?? res.data;
}

export async function updatePayable(id, data) {
  const res = await apiClient.patch(`/v1/payables-lite/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deletePayable(id) {
  const res = await apiClient.delete(`/v1/payables-lite/${id}`);
  return res.data?.data ?? res.data;
}
