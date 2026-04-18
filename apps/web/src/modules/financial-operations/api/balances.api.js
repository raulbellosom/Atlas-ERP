import { apiClient } from "@/api/client";

/**
 * API layer — Balance Snapshots.
 * Endpoints: v1/balance-snapshots
 */

export async function fetchBalanceSnapshots(params = {}) {
  const res = await apiClient.get("/v1/balance-snapshots", { params });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function fetchLatestSnapshot(bankAccountId) {
  const res = await apiClient.get(`/v1/balance-snapshots/bank-account/${bankAccountId}/latest`);
  return res.data?.data ?? res.data;
}

export async function fetchBalanceSnapshot(id) {
  const res = await apiClient.get(`/v1/balance-snapshots/${id}`);
  return res.data?.data ?? res.data;
}
