import { apiClient } from "@/api/client";

/**
 * API layer — Transfers.
 * Endpoints: v1/transfers
 * Permisos: finops:transfer:read / :write
 */

export async function fetchTransfers(params = {}) {
  const res = await apiClient.get("/v1/transfers", { params });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function fetchTransfer(id) {
  const res = await apiClient.get(`/v1/transfers/${id}`);
  return res.data?.data ?? res.data;
}

export async function createTransfer(data) {
  const res = await apiClient.post("/v1/transfers", data);
  return res.data?.data ?? res.data;
}

export async function updateTransfer(id, data) {
  const res = await apiClient.patch(`/v1/transfers/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deleteTransfer(id) {
  const res = await apiClient.delete(`/v1/transfers/${id}`);
  return res.data?.data ?? res.data;
}
