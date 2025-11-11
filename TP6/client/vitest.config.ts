import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // usar 'happy-dom' evita el problema con jsdom/parse5 ESM
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    coverage: { provider: 'v8' }
  }
});