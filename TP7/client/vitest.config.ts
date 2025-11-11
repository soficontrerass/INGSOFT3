import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',                // o 'c8'
      reporter: ['text', 'lcov', 'json-summary'],
      all: true
    }
  }
});