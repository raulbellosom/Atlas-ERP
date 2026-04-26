let seq = 0;

export function transferFactory(overrides: Record<string, unknown> = {}) {
  seq++;
  return {
    id: `tr-${seq}`,
    organizationId: 'org-1',
    fromBankAccountId: 'ba-1',
    toBankAccountId: 'ba-2',
    branchId: null,
    outgoingMovementId: null,
    incomingMovementId: null,
    initiatedById: 'user-1',
    approvedById: null,
    status: 'POSTED',
    amount: '500',
    currencyCode: 'MXN',
    occurredAt: new Date('2026-01-15'),
    description: `Transferencia ${seq}`,
    reference: null,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    ...overrides,
  };
}
