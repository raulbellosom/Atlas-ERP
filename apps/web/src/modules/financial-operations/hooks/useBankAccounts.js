import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBankAccounts,
  fetchBankAccount,
  fetchBankAccountBalance,
  fetchBalanceSummary,
  fetchActiveCount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../api/bank-accounts.api";
import { buildFiltersKey, normalizeFilters } from "./queryFilters";

/**
 * React Query hooks para el recurso BankAccount.
 *
 * Query keys:
 *   ["bank-accounts", organizationId, filters]
 *   ["bank-account", id]
 *   ["bank-account-balance", id]
 *   ["bank-accounts-summary", organizationId]
 *   ["bank-accounts-active-count", organizationId]
 */

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Listar cuentas bancarias de la organización con filtros opcionales. */
export function useBankAccounts(organizationId, filters = {}) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: [
      "bank-accounts",
      organizationId,
      buildFiltersKey(normalizedFilters),
    ],
    queryFn: () =>
      fetchBankAccounts({ organizationId, ...normalizedFilters }),
    enabled: Boolean(organizationId),
  });
}

/** Obtener una cuenta bancaria por ID. */
export function useBankAccount(id) {
  return useQuery({
    queryKey: ["bank-account", id],
    queryFn: () => fetchBankAccount(id),
    enabled: Boolean(id),
  });
}

/** Obtener el saldo actual de una cuenta bancaria. */
export function useBankAccountBalance(id) {
  return useQuery({
    queryKey: ["bank-account-balance", id],
    queryFn: () => fetchBankAccountBalance(id),
    enabled: Boolean(id),
  });
}

/** Resumen de saldos por organización. */
export function useBalanceSummary(organizationId) {
  return useQuery({
    queryKey: ["bank-accounts-summary", organizationId],
    queryFn: () => fetchBalanceSummary(organizationId),
    enabled: Boolean(organizationId),
  });
}

/** Contar cuentas activas. */
export function useActiveAccountCount(organizationId) {
  return useQuery({
    queryKey: ["bank-accounts-active-count", organizationId],
    queryFn: () => fetchActiveCount(organizationId),
    enabled: Boolean(organizationId),
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Crear una nueva cuenta bancaria. Invalida la lista tras éxito. */
export function useCreateBankAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createBankAccount(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts-summary"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts-active-count"] });
    },
  });
}

/** Actualizar una cuenta bancaria existente. */
export function useUpdateBankAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBankAccount(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["bank-account", id] });
      qc.invalidateQueries({ queryKey: ["bank-account-balance", id] });
      qc.invalidateQueries({ queryKey: ["bank-accounts-summary"] });
    },
  });
}

/** Soft-delete una cuenta bancaria. */
export function useDeleteBankAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteBankAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts-summary"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts-active-count"] });
    },
  });
}
