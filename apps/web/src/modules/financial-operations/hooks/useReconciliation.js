import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchReconciliationSessions,
  fetchReconciliationSession,
  fetchReconciliationItems,
  reconcileSession,
  closeSession,
  approveSession,
} from "../api/reconciliation.api";
import { buildFiltersKey, normalizeFilters } from "./queryFilters";

export function useReconciliationSessions(organizationId, filters = {}) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: [
      "reconciliation-sessions",
      organizationId,
      buildFiltersKey(normalizedFilters),
    ],
    queryFn: () =>
      fetchReconciliationSessions({ organizationId, ...normalizedFilters }),
    enabled: Boolean(organizationId),
  });
}

export function useReconciliationSession(id) {
  return useQuery({
    queryKey: ["reconciliation-session", id],
    queryFn: () => fetchReconciliationSession(id),
    enabled: Boolean(id),
  });
}

export function useReconciliationItems(sessionId, filters = {}) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: [
      "reconciliation-items",
      sessionId,
      buildFiltersKey(normalizedFilters),
    ],
    queryFn: () => fetchReconciliationItems(sessionId, normalizedFilters),
    enabled: Boolean(sessionId),
  });
}

export function useReconcileSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }) => reconcileSession(sessionId, data),
    onSuccess: (_d, { sessionId }) => {
      qc.invalidateQueries({ queryKey: ["reconciliation-session", sessionId] });
      qc.invalidateQueries({ queryKey: ["reconciliation-items", sessionId] });
      qc.invalidateQueries({ queryKey: ["reconciliation-sessions"] });
      qc.invalidateQueries({ queryKey: ["movements"] });
    },
  });
}

export function useCloseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }) => closeSession(sessionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reconciliation-sessions"] });
      qc.invalidateQueries({ queryKey: ["reconciliation-session"] });
    },
  });
}

export function useApproveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }) => approveSession(sessionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reconciliation-sessions"] });
      qc.invalidateQueries({ queryKey: ["reconciliation-session"] });
    },
  });
}
