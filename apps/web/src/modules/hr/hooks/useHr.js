import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDepartments,
  createDepartment,
  fetchPositions,
  createPosition,
  fetchEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  terminateEmployee,
  fetchLeaveRequests,
  createLeaveRequest,
  reviewLeaveRequest,
} from '../api/hr.api';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const HR_KEYS = {
  departments: (orgId) => ['hr-departments', orgId],
  positions: (orgId, deptId) => ['hr-positions', orgId, deptId],
  employees: (orgId, filters) => ['hr-employees', orgId, filters],
  employee: (id) => ['hr-employee', id],
  leaves: (orgId, empId) => ['hr-leaves', orgId, empId],
};

// ─── Departments ──────────────────────────────────────────────────────────────

export function useDepartments(organizationId) {
  return useQuery({
    queryKey: HR_KEYS.departments(organizationId),
    queryFn: () => fetchDepartments(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hr-departments', vars.organizationId] });
    },
  });
}

// ─── Positions ────────────────────────────────────────────────────────────────

export function usePositions(organizationId, departmentId) {
  return useQuery({
    queryKey: HR_KEYS.positions(organizationId, departmentId),
    queryFn: () => fetchPositions(organizationId, departmentId),
    enabled: Boolean(organizationId),
  });
}

export function useCreatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPosition,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hr-positions', vars.organizationId] });
    },
  });
}

// ─── Employees ────────────────────────────────────────────────────────────────

export function useEmployees(organizationId, filters = {}) {
  return useQuery({
    queryKey: HR_KEYS.employees(organizationId, filters),
    queryFn: () => fetchEmployees({ organizationId, ...filters }),
    enabled: Boolean(organizationId),
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: HR_KEYS.employee(id),
    queryFn: () => fetchEmployee(id),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hr-employees', vars.organizationId] });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updateEmployee(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr-employees'] });
      qc.invalidateQueries({ queryKey: ['hr-employee'] });
    },
  });
}

export function useTerminateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actorId }) => terminateEmployee(id, actorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr-employees'] });
      qc.invalidateQueries({ queryKey: ['hr-employee'] });
    },
  });
}

// ─── Leave Requests ───────────────────────────────────────────────────────────

export function useLeaveRequests(organizationId, employeeId) {
  return useQuery({
    queryKey: HR_KEYS.leaves(organizationId, employeeId),
    queryFn: () => fetchLeaveRequests({ organizationId, employeeId }),
    enabled: Boolean(organizationId),
  });
}

export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hr-leaves', vars.organizationId] });
    },
  });
}

export function useReviewLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewedById, status }) => reviewLeaveRequest(id, { reviewedById, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr-leaves'] });
    },
  });
}
