import { ManifestValidatorService } from './manifest-validator.service';

const VALID_MANIFEST = {
  moduleKey: 'financial-operations',
  version: '1.0.0',
  compatibility: '>=1.0.0',
  dependencies: [{ moduleKey: 'core-platform', versionConstraint: '>=1.0.0', hard: true }],
  migrations: ['001_initial.sql'],
  seeds: ['finops.seed.ts'],
  permissions: ['finops:bank_account:read', 'finops:bank_account:write'],
  featureFlags: { finops_reconciliation: false },
  uiSurfaces: ['sidebar', 'dashboard'],
};

describe('ManifestValidatorService', () => {
  let svc: ManifestValidatorService;

  beforeEach(() => {
    svc = new ManifestValidatorService();
  });

  it('accepts a valid manifest', async () => {
    const result = await svc.validate(VALID_MANIFEST);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects manifest missing moduleKey', async () => {
    const manifest = { ...VALID_MANIFEST, moduleKey: '' };
    const result = await svc.validate(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.property === 'moduleKey')).toBe(true);
  });

  it('rejects manifest missing version', async () => {
    const manifest = { ...VALID_MANIFEST, version: undefined as unknown as string };
    const result = await svc.validate(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.property === 'version')).toBe(true);
  });

  it('rejects manifest with invalid dependency (missing versionConstraint)', async () => {
    const manifest = {
      ...VALID_MANIFEST,
      dependencies: [{ moduleKey: 'core-platform' }],
    };
    const result = await svc.validate(manifest as never);
    expect(result.valid).toBe(false);
  });

  it('rejects manifest where dependencies is not an array', async () => {
    const manifest = { ...VALID_MANIFEST, dependencies: 'bad' as never };
    const result = await svc.validate(manifest);
    expect(result.valid).toBe(false);
  });

  it('rejects manifest where featureFlags is not an object', async () => {
    const manifest = { ...VALID_MANIFEST, featureFlags: ['bad'] as never };
    const result = await svc.validate(manifest);
    expect(result.valid).toBe(false);
  });

  it('rejects manifest with non-string permissions array items', async () => {
    const manifest = { ...VALID_MANIFEST, permissions: [123] as never };
    const result = await svc.validate(manifest);
    expect(result.valid).toBe(false);
  });

  it('marks core-platform as non-uninstallable', () => {
    expect(svc.isCore('core-platform')).toBe(true);
    expect(svc.isCore('financial-operations')).toBe(false);
  });
});
