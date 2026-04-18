import { useQuery } from "@tanstack/react-query";
import { fetchBalanceSnapshots, fetchLatestSnapshot } from "../api/balances.api";
import { buildFiltersKey, normalizeFilters } from "./queryFilters";

export function useBalanceSnapshots(organizationId, filters = {}) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: [
      "balance-snapshots",
      organizationId,
      buildFiltersKey(normalizedFilters),
    ],
    queryFn: () => fetchBalanceSnapshots({ organizationId, ...normalizedFilters }),
    enabled: Boolean(organizationId),
  });
}

export function useLatestSnapshot(bankAccountId) {
  return useQuery({
    queryKey: ["balance-snapshot-latest", bankAccountId],
    queryFn: () => fetchLatestSnapshot(bankAccountId),
    enabled: Boolean(bankAccountId),
  });
}
