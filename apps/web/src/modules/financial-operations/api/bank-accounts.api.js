import { apiClient } from "@/api/client";

/**
 * API layer — Bank Accounts.
 *
 * Mapea 1:1 a los endpoints del BankAccountsController (v1/bank-accounts).
 * Permisos requeridos: finops:bank_account:read / finops:bank_account:write
 */

/**
 * Listar cuentas bancarias de la organización.
 * @param {{ organizationId: string, includeInactive?: boolean, search?: string }} params
 */
export async function fetchBankAccounts({ organizationId, includeInactive, search } = {}) {
  const res = await apiClient.get("/v1/bank-accounts", {
    params: { organizationId, includeInactive, search },
  });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

/**
 * Obtener una cuenta bancaria por ID.
 * @param {string} id
 */
export async function fetchBankAccount(id) {
  const res = await apiClient.get(`/v1/bank-accounts/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * Obtener el saldo actual de una cuenta bancaria.
 * @param {string} id
 */
export async function fetchBankAccountBalance(id) {
  const res = await apiClient.get(`/v1/bank-accounts/${id}/balance`);
  return res.data?.data ?? res.data;
}

/**
 * Resumen de saldos por organización.
 * @param {string} organizationId
 * @param {{ includeInactive?: boolean }} opts
 */
export async function fetchBalanceSummary(organizationId, { includeInactive } = {}) {
  const res = await apiClient.get(
    `/v1/bank-accounts/organization/${organizationId}/balance-summary`,
    { params: { includeInactive } },
  );
  return res.data?.data ?? res.data;
}

/**
 * Contar cuentas activas de la organización.
 * @param {string} organizationId
 */
export async function fetchActiveCount(organizationId) {
  const res = await apiClient.get(
    `/v1/bank-accounts/organization/${organizationId}/active-count`,
  );
  return res.data?.data ?? res.data;
}

/**
 * Crear una nueva cuenta bancaria.
 * @param {object} data — Campos del CreateBankAccountDto
 */
export async function createBankAccount(data) {
  const res = await apiClient.post("/v1/bank-accounts", data);
  return res.data?.data ?? res.data;
}

/**
 * Actualizar una cuenta bancaria.
 * @param {string} id
 * @param {object} data — Campos del UpdateBankAccountDto
 */
export async function updateBankAccount(id, data) {
  const res = await apiClient.patch(`/v1/bank-accounts/${id}`, data);
  return res.data?.data ?? res.data;
}

/**
 * Soft-delete una cuenta bancaria.
 * @param {string} id
 */
export async function deleteBankAccount(id) {
  const res = await apiClient.delete(`/v1/bank-accounts/${id}`);
  return res.data?.data ?? res.data;
}
