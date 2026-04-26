let seq = 0;

export function balanceSnapshotFactory(overrides: Record<string, unknown> = {}) {
  seq++;
  return {
    id: `bs-${seq}`,
    organizationId: 'org-1',
    bankAccountId: 'ba-1',
    branchId: null,
    capturedById: 'user-1',
    snapshotAt: new Date('2026-01-31'),
    balance: '5000',
    currencyCode: 'MXN',
    source: 'MANUAL',
    metadata: null,
    createdAt: new Date('2026-01-31'),
    updatedAt: new Date('2026-01-31'),
    ...overrides,
  };
}
