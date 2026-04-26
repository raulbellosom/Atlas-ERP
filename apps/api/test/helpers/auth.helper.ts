import * as jwt from 'jsonwebtoken';

export interface TestUserPayload {
  sub: string;
  organizationId: string;
  branchId: string | null;
}

const TEST_JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-secret-atlas-erp-integration';

export function generateTestToken(payload?: Partial<TestUserPayload>): string {
  const defaults: TestUserPayload = {
    sub: 'user-test-001',
    organizationId: 'org-test-001',
    branchId: null,
  };

  return jwt.sign({ ...defaults, ...payload }, TEST_JWT_SECRET, {
    expiresIn: '1h',
  });
}

export function authHeader(token?: string): { Authorization: string } {
  return { Authorization: `Bearer ${token ?? generateTestToken()}` };
}
