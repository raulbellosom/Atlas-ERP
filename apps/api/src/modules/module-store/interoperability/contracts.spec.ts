import {
  assertValidInteroperabilityContracts,
  getModuleInteroperabilityContract,
  MODULE_INTEROPERABILITY_CONTRACTS,
} from './contracts';

describe('Module interoperability contracts', () => {
  it('validates ownership, cross-module access and versioned events', () => {
    expect(() => assertValidInteroperabilityContracts()).not.toThrow();
  });

  it('contains curated contracts for core, finops, accounting and hr', () => {
    expect(getModuleInteroperabilityContract('core-platform')).toBeTruthy();
    expect(getModuleInteroperabilityContract('financial-operations')).toBeTruthy();
    expect(getModuleInteroperabilityContract('accounting')).toBeTruthy();
    expect(getModuleInteroperabilityContract('hr')).toBeTruthy();
  });

  it('returns null for unknown module keys', () => {
    expect(getModuleInteroperabilityContract('unknown-module')).toBeNull();
  });

  it('ensures every published event has semantic version', () => {
    const allContracts = Object.values(MODULE_INTEROPERABILITY_CONTRACTS);
    const invalidVersion = allContracts.flatMap((contract) =>
      contract.domainEvents.filter((event) => !/^\d+\.\d+\.\d+$/.test(event.version)),
    );

    expect(invalidVersion).toHaveLength(0);
  });
});
