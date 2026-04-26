let seq = 0;

export function bankAccountFactory(overrides: Record<string, unknown> = {}) {
  seq++;
  return {
    id: `ba-${seq}`,
    organizationId: 'org-1',
    branchId: null,
    bankAccountTypeId: null,
    createdById: 'user-1',
    name: `Cuenta ${seq}`,
    bankName: `Banco ${seq}`,
    accountHolder: `Titular ${seq}`,
    accountNumberMask: `****${seq.toString().padStart(4, '0')}`,
    currencyCode: 'MXN',
    currentBalance: '0',
    isActive: true,
    metadata: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...overrides,
  };
}
