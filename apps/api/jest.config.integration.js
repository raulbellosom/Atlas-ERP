/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '\\.integration\\.spec\\.ts$',
  testTimeout: 30000,
  setupFiles: ['<rootDir>/test/setup/integration-env.ts'],
  globalSetup: '<rootDir>/test/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/setup/global-teardown.ts',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/test/integration'],
};
