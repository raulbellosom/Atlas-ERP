import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCounterparties,
  fetchCounterparty,
  createCounterparty,
  updateCounterparty,
  deleteCounterparty,
} from '../api/counterparties.api';

export function useCounterparties(organizationId, params = {}) {
  return useQuery({
    queryKey: ['counterparties', organizationId, params],
    queryFn: () => fetchCounterparties({ organizationId, ...params }),
    enabled: Boolean(organizationId),
  });
}

export function useCounterparty(id) {
  return useQuery({
    queryKey: ['counterparty', id],
    queryFn: () => fetchCounterparty(id),
    enabled: Boolean(id),
  });
}

export function useCreateCounterparty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createCounterparty(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['counterparties'] }),
  });
}

export function useUpdateCounterparty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCounterparty(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['counterparties'] });
      qc.invalidateQueries({ queryKey: ['counterparty', id] });
    },
  });
}

export function useDeleteCounterparty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCounterparty(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['counterparties'] }),
  });
}
