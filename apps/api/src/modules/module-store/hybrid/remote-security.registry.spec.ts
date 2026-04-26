import {
  findRemotePackageSecurityRecord,
  isRolloutStageAllowed,
  verifySignature,
} from './remote-security.registry';

describe('remote-security.registry', () => {
  it('returns package metadata for curated remote entry', () => {
    const record = findRemotePackageSecurityRecord('accounting', '1.0.0');
    expect(record).toBeTruthy();
    expect(record?.moduleKey).toBe('accounting');
  });

  it('validates expected signature format', () => {
    expect(verifySignature('curated-v1', 'atlas-sign-v1:curated-v1')).toBe(true);
    expect(verifySignature('curated-v1', 'invalid-signature')).toBe(false);
    expect(
      verifySignature('curated-v1', 'atlas-sign-v1:curated-v1', ['external-sign-v2']),
    ).toBe(false);
  });

  it('enforces rollout order canary -> partial -> total', () => {
    expect(isRolloutStageAllowed('canary', 'canary')).toBe(true);
    expect(isRolloutStageAllowed('canary', 'partial')).toBe(false);
    expect(isRolloutStageAllowed('partial', 'canary')).toBe(true);
    expect(isRolloutStageAllowed('total', 'partial')).toBe(true);
  });
});
