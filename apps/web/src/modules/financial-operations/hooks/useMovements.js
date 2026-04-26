import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMovements,
  fetchMovement,
  fetchMovementsByFilters,
  createMovement,
  updateMovement,
  deleteMovement,
  fetchMovementAttachments,
  uploadMovementAttachment,
  updateMovementAttachment,
  deleteMovementAttachment,
} from '../api/movements.api';
import { buildFiltersKey, normalizeFilters } from './queryFilters';

/**
 * React Query hooks — Financial Movements.
 *
 * Query keys:
 *   ["movements", organizationId, filters]
 *   ["movement", id]
 *   ["movement-attachments", movementId]
 */

export function useMovements(organizationId, filters = {}) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: ['movements', organizationId, buildFiltersKey(normalizedFilters)],
    queryFn: () => fetchMovements({ organizationId, ...normalizedFilters }),
    enabled: Boolean(organizationId),
  });
}

/** Hook de reporte — carga movimientos con filtros avanzados. Habilitado solo cuando se proveen fechas. */
export function useMovementsByFilters(organizationId, filters = {}, enabled = false) {
  const normalizedFilters = normalizeFilters(filters);
  return useQuery({
    queryKey: ['movements-report', organizationId, buildFiltersKey(normalizedFilters)],
    queryFn: () => fetchMovementsByFilters({ organizationId, ...normalizedFilters }),
    enabled: Boolean(organizationId) && enabled,
  });
}

export function useMovement(id) {
  return useQuery({
    queryKey: ['movement', id],
    queryFn: () => fetchMovement(id),
    enabled: Boolean(id),
  });
}

export function useMovementAttachments(movementId) {
  return useQuery({
    queryKey: ['movement-attachments', movementId],
    queryFn: () => fetchMovementAttachments(movementId),
    enabled: Boolean(movementId),
  });
}

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createMovement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movements'] });
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });
      qc.invalidateQueries({ queryKey: ['bank-account-balance'] });
      qc.invalidateQueries({ queryKey: ['bank-accounts-summary'] });
    },
  });
}

export function useUpdateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateMovement(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['movements'] });
      qc.invalidateQueries({ queryKey: ['movement', id] });
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
}

export function useDeleteMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteMovement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movements'] });
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });
      qc.invalidateQueries({ queryKey: ['bank-accounts-summary'] });
    },
  });
}

export function useUploadMovementAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movementId, file, meta }) => uploadMovementAttachment(movementId, file, meta),
    onSuccess: (_data, { movementId }) => {
      qc.invalidateQueries({ queryKey: ['movement-attachments', movementId] });
    },
  });
}

export function useUpdateMovementAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movementId, attachmentId, meta }) =>
      updateMovementAttachment(movementId, attachmentId, meta),
    onSuccess: (_data, { movementId }) => {
      qc.invalidateQueries({ queryKey: ['movement-attachments', movementId] });
    },
  });
}

export function useDeleteMovementAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movementId, attachmentId }) =>
      deleteMovementAttachment(movementId, attachmentId),
    onSuccess: (_data, { movementId }) => {
      qc.invalidateQueries({ queryKey: ['movement-attachments', movementId] });
    },
  });
}
