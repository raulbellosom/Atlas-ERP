/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '\\.spec\\.ts$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coverageDirectory: 'coverage/unit',
  collectCoverageFrom: [
    'src/**/*.service.ts',
    'src/**/*.guard.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
  ],
  roots: ['<rootDir>/src'],
};
