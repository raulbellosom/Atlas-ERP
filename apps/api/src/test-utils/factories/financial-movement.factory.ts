let seq = 0;

export function financialMovementFactory(overrides: Record<string, unknown> = {}) {
  seq++;
  return {
    id: `fm-${seq}`,
    organizationId: 'org-1',
    bankAccountId: 'ba-1',
    branchId: null,
    createdById: 'user-1',
    movementType: 'CREDIT',
    status: 'POSTED',
    amount: '1000',
    currencyCode: 'MXN',
    occurredAt: new Date('2026-01-15'),
    description: `Movimiento ${seq}`,
    reference: null,
    isReconciled: false,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    deletedAt: null,
    ...overrides,
  };
}
