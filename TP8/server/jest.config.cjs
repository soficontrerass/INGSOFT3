module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': 'ts-jest' },
  testMatch: ['**/src/**/?(*.)+(test).ts', '**/?(*.)+(test).ts', '**/src/tests/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'lcov', 'text'],
  collectCoverageFrom: ['src/**/*.ts', '!src/tests/**'],
  setupFiles: ['<rootDir>/src/tests/jest.setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/']
};