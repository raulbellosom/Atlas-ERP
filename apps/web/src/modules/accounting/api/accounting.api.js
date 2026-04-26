import { apiClient } from '@/api/client';

// ─── Chart of Accounts ────────────────────────────────────────────────────────

export async function fetchChartOfAccounts({ organizationId, isActive } = {}) {
  const res = await apiClient.get('/v1/accounting/chart-of-accounts', {
    params: { organizationId, isActive },
  });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function createChartOfAccount(data) {
  const res = await apiClient.post('/v1/accounting/chart-of-accounts', data);
  return res.data?.data ?? res.data;
}

export async function updateChartOfAccount(id, data) {
  const res = await apiClient.patch(`/v1/accounting/chart-of-accounts/${id}`, data);
  return res.data?.data ?? res.data;
}

// ─── Fiscal Periods ───────────────────────────────────────────────────────────

export async function fetchFiscalPeriods(organizationId) {
  const res = await apiClient.get('/v1/accounting/fiscal-periods', {
    params: { organizationId },
  });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function createFiscalPeriod(data) {
  const res = await apiClient.post('/v1/accounting/fiscal-periods', data);
  return res.data?.data ?? res.data;
}

export async function closeFiscalPeriod(id) {
  const res = await apiClient.patch(`/v1/accounting/fiscal-periods/${id}/close`);
  return res.data?.data ?? res.data;
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

export async function fetchJournalEntries({ organizationId, year, month } = {}) {
  const res = await apiClient.get('/v1/accounting/journal-entries', {
    params: { organizationId, year, month },
  });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export async function fetchJournalEntry(id) {
  const res = await apiClient.get(`/v1/accounting/journal-entries/${id}`);
  return res.data?.data ?? res.data;
}

// ─── Reports ───────────────────────────────────────────────────────────────────

export async function fetchTrialBalanceReport({ organizationId, year, month } = {}) {
  const res = await apiClient.get('/v1/accounting/reports/trial-balance', {
    params: { organizationId, year, month },
  });
  return res.data?.data ?? res.data;
}

export async function fetchIncomeStatementReport({ organizationId, year, month } = {}) {
  const res = await apiClient.get('/v1/accounting/reports/income-statement', {
    params: { organizationId, year, month },
  });
  return res.data?.data ?? res.data;
}

export async function fetchBalanceSheetReport({ organizationId, year, month } = {}) {
  const res = await apiClient.get('/v1/accounting/reports/balance-sheet', {
    params: { organizationId, year, month },
  });
  return res.data?.data ?? res.data;
}
