import { apiClient } from '@/api/client';

// ─── Departments ──────────────────────────────────────────────────────────────

export async function fetchDepartments(organizationId) {
  const res = await apiClient.get('/v1/hr/departments', { params: { organizationId } });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function createDepartment(data) {
  const res = await apiClient.post('/v1/hr/departments', data);
  return res.data?.data ?? res.data;
}

// ─── Positions ────────────────────────────────────────────────────────────────

export async function fetchPositions(organizationId, departmentId) {
  const res = await apiClient.get('/v1/hr/positions', {
    params: { organizationId, departmentId },
  });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function createPosition(data) {
  const res = await apiClient.post('/v1/hr/positions', data);
  return res.data?.data ?? res.data;
}

// ─── Employees ────────────────────────────────────────────────────────────────

export async function fetchEmployees({ organizationId, departmentId, status, limit } = {}) {
  const res = await apiClient.get('/v1/hr/employees', {
    params: { organizationId, departmentId, status, limit },
  });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function fetchEmployee(id) {
  const res = await apiClient.get(`/v1/hr/employees/${id}`);
  return res.data?.data ?? res.data;
}

export async function createEmployee(data) {
  const res = await apiClient.post('/v1/hr/employees', data);
  return res.data?.data ?? res.data;
}

export async function updateEmployee(id, data) {
  const res = await apiClient.patch(`/v1/hr/employees/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function terminateEmployee(id, actorId) {
  const res = await apiClient.delete(`/v1/hr/employees/${id}`, {
    params: { actorId },
  });
  return res.data?.data ?? res.data;
}

export async function fetchEmployeeContracts(employeeId) {
  const res = await apiClient.get(`/v1/hr/employees/${employeeId}/contracts`);
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

// ─── Leave Requests ───────────────────────────────────────────────────────────

export async function fetchLeaveRequests({ organizationId, employeeId } = {}) {
  const res = await apiClient.get('/v1/hr/leave-requests', {
    params: { organizationId, employeeId },
  });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function createLeaveRequest(data) {
  const res = await apiClient.post('/v1/hr/leave-requests', data);
  return res.data?.data ?? res.data;
}

export async function reviewLeaveRequest(id, { reviewedById, status }) {
  const res = await apiClient.put(`/v1/hr/leave-requests/${id}/review`, {
    reviewedById,
    status,
  });
  return res.data?.data ?? res.data;
}
