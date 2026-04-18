import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTransfers,
  fetchTransfer,
  createTransfer,
} from "../api/transfers.api";
import { buildFiltersKey, normalizeFilters } from "./queryFilters";

/**
 * React Query hooks — Transfers.
 */

export function useTransfers(organizationId, filters = {}) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: ["transfers", organizationId, buildFiltersKey(normalizedFilters)],
    queryFn: () => fetchTransfers({ organizationId, ...normalizedFilters }),
    enabled: Boolean(organizationId),
  });
}

/** Hook de reporte — habilitado solo cuando `enabled` es true (fechas provistas). */
export function useTransfersByFilters(organizationId, filters = {}, enabled = false) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: ["transfers-report", organizationId, buildFiltersKey(normalizedFilters)],
    queryFn: () => fetchTransfers({ organizationId, ...normalizedFilters }),
    enabled: Boolean(organizationId) && enabled,
  });
}

export function useTransfer(id) {
  return useQuery({
    queryKey: ["transfer", id],
    queryFn: () => fetchTransfer(id),
    enabled: Boolean(id),
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createTransfer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers"] });
      qc.invalidateQueries({ queryKey: ["movements"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["bank-account-balance"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts-summary"] });
    },
  });
}
