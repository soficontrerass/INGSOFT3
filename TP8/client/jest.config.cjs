module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)','**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: { '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest' },
  collectCoverage: true,
  coverageDirectory: 'coverage'
};