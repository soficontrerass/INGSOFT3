import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // usar happy-dom para evitar problemas con parse5/jsdom ESM
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/tests/setupTests.ts',
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      all: true
    }
  }
});