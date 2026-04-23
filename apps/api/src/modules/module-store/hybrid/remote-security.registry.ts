export type RemoteRolloutStage = 'canary' | 'partial' | 'total';

export interface RemotePackageSecurityRecord {
  moduleKey: string;
  version: string;
  checksum: string;
  signature: string;
  rolloutStage: RemoteRolloutStage;
  allowedOrganizationIds?: string[];
}

function signatureForChecksum(checksum: string): string {
  return `atlas-sign-v1:${checksum}`;
}

export function verifySignature(checksum: string, signature: string): boolean {
  return signatureForChecksum(checksum) === signature;
}

export const REMOTE_PACKAGE_SECURITY_REGISTRY: ReadonlyArray<RemotePackageSecurityRecord> =
  Object.freeze([
    {
      moduleKey: 'core-platform',
      version: '1.0.0',
      checksum: 'curated-v1',
      signature: signatureForChecksum('curated-v1'),
      rolloutStage: 'total',
    },
    {
      moduleKey: 'financial-operations',
      version: '1.0.0',
      checksum: 'curated-v1',
      signature: signatureForChecksum('curated-v1'),
      rolloutStage: 'partial',
    },
    {
      moduleKey: 'accounting',
      version: '1.0.0',
      checksum: 'curated-v1',
      signature: signatureForChecksum('curated-v1'),
      rolloutStage: 'canary',
      allowedOrganizationIds: ['org-e2e-module-store'],
    },
    {
      moduleKey: 'hr',
      version: '1.0.0',
      checksum: 'curated-v1',
      signature: signatureForChecksum('curated-v1'),
      rolloutStage: 'partial',
    },
  ]);

export function findRemotePackageSecurityRecord(
  moduleKey: string,
  version: string,
): RemotePackageSecurityRecord | null {
  return (
    REMOTE_PACKAGE_SECURITY_REGISTRY.find(
      (entry) => entry.moduleKey === moduleKey && entry.version === version,
    ) ?? null
  );
}

export function isRolloutStageAllowed(
  activeStage: RemoteRolloutStage,
  packageStage: RemoteRolloutStage,
): boolean {
  const order: Record<RemoteRolloutStage, number> = {
    canary: 1,
    partial: 2,
    total: 3,
  };
  return order[activeStage] >= order[packageStage];
}
