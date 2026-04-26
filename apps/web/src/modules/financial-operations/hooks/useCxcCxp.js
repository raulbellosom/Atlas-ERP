import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchReceivables,
  fetchReceivable,
  createReceivable,
  updateReceivable,
  deleteReceivable,
  registerReceivablePayment,
  fetchPayables,
  fetchPayable,
  createPayable,
  updatePayable,
  deletePayable,
  registerPayablePayment,
} from '../api/cxc-cxp.api';
import { buildFiltersKey, normalizeFilters } from './queryFilters';

// ── Receivables (CxC) ───────────────────────────────────────────────────────

export function useReceivables(organizationId, filters = {}) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: ['receivables', organizationId, buildFiltersKey(normalizedFilters)],
    queryFn: () => fetchReceivables({ organizationId, ...normalizedFilters }),
    enabled: Boolean(organizationId),
  });
}

export function useReceivable(id) {
  return useQuery({
    queryKey: ['receivable', id],
    queryFn: () => fetchReceivable(id),
    enabled: Boolean(id),
  });
}

export function useCreateReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createReceivable(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['receivables'] }),
  });
}

export function useUpdateReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateReceivable(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['receivables'] });
      qc.invalidateQueries({ queryKey: ['receivable', id] });
    },
  });
}

export function useDeleteReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteReceivable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['receivables'] }),
  });
}

export function useRegisterReceivablePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => registerReceivablePayment(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['receivables'] });
      qc.invalidateQueries({ queryKey: ['receivable', id] });
    },
  });
}

// ── Payables (CxP) ──────────────────────────────────────────────────────────

export function usePayables(organizationId, filters = {}) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: ['payables', organizationId, buildFiltersKey(normalizedFilters)],
    queryFn: () => fetchPayables({ organizationId, ...normalizedFilters }),
    enabled: Boolean(organizationId),
  });
}

export function usePayable(id) {
  return useQuery({
    queryKey: ['payable', id],
    queryFn: () => fetchPayable(id),
    enabled: Boolean(id),
  });
}

export function useCreatePayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createPayable(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payables'] }),
  });
}

export function useUpdatePayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updatePayable(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['payables'] });
      qc.invalidateQueries({ queryKey: ['payable', id] });
    },
  });
}

export function useDeletePayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePayable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payables'] }),
  });
}

export function useRegisterPayablePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => registerPayablePayment(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['payables'] });
      qc.invalidateQueries({ queryKey: ['payable', id] });
    },
  });
}
