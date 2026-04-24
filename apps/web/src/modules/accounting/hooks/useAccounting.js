import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchChartOfAccounts,
  createChartOfAccount,
  updateChartOfAccount,
  fetchFiscalPeriods,
  createFiscalPeriod,
  closeFiscalPeriod,
  fetchJournalEntries,
  fetchJournalEntry,
} from '../api/accounting.api';

export const ACCOUNTING_KEYS = {
  chartOfAccounts: (orgId, filters) => ['accounting-coa', orgId, filters],
  fiscalPeriods: (orgId) => ['accounting-fiscal-periods', orgId],
  journalEntries: (orgId, filters) => ['accounting-journal-entries', orgId, filters],
  journalEntry: (id) => ['accounting-journal-entry', id],
};

// ─── Chart of Accounts ────────────────────────────────────────────────────────

export function useChartOfAccounts(organizationId, filters = {}) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.chartOfAccounts(organizationId, filters),
    queryFn: () => fetchChartOfAccounts({ organizationId, ...filters }),
    enabled: Boolean(organizationId),
  });
}

export function useCreateChartOfAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createChartOfAccount,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['accounting-coa', vars.organizationId] });
    },
  });
}

export function useUpdateChartOfAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updateChartOfAccount(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['accounting-coa', vars.organizationId] });
    },
  });
}

// ─── Fiscal Periods ───────────────────────────────────────────────────────────

export function useFiscalPeriods(organizationId) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.fiscalPeriods(organizationId),
    queryFn: () => fetchFiscalPeriods(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useCreateFiscalPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFiscalPeriod,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['accounting-fiscal-periods', vars.organizationId] });
    },
  });
}

export function useCloseFiscalPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => closeFiscalPeriod(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounting-fiscal-periods'] });
    },
  });
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

export function useJournalEntries(organizationId, filters = {}) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.journalEntries(organizationId, filters),
    queryFn: () => fetchJournalEntries({ organizationId, ...filters }),
    enabled: Boolean(organizationId),
  });
}

export function useJournalEntry(id) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.journalEntry(id),
    queryFn: () => fetchJournalEntry(id),
    enabled: Boolean(id),
  });
}
