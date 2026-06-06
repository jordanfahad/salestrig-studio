// Standalone Jest config for Salestrig Studio unit tests.
// The repo's root jest.config.ts depends on @nx/jest (not installed here); this
// config runs Salestrig specs directly via ts-jest in transpile-only mode.
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/libraries', '<rootDir>/apps'],
  testMatch: ['**/*.salestrig.spec.ts', '**/subscriptions/pricing.spec.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { isolatedModules: true, diagnostics: false },
    ],
  },
};
