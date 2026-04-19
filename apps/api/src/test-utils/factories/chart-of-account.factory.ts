let seq = 0;

export function chartOfAccountFactory(overrides: Record<string, unknown> = {}) {
  seq++;
  return {
    id: `coa-${seq}`,
    organizationId: 'org-1',
    code: `${1000 + seq}`,
    name: `Cuenta ${seq}`,
    accountType: 'ASSET',
    isActive: true,
    parentId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}
