// ...existing code...
import { defineConfig } from 'vitest/config';

const coverageOptions: any = {
  provider: 'v8',
  reporter: ['text', 'lcov', 'json-summary'],
  reportsDirectory: 'coverage',
  all: true,
  include: ['src/**/*.{ts,tsx,js,jsx}'],
  exclude: [
    '**/*.test.*',
    '**/*.spec.*',
    'node_modules/**',
    'src/vite-env.d.ts'
    // NO excluir src/setupTests.ts si querés que aparezca en coverage
  ],
};

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/setupTests.ts', // <--- asegurarse que apunta al setup elegido
    testTimeout: 20000,
    coverage: coverageOptions,
  },
});
// ...existing code...