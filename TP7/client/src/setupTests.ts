import '@testing-library/jest-dom';
import { vi } from 'vitest';

// stub global fetch for tests
vi.stubGlobal('fetch', async (input: RequestInfo) => {
  const url = typeof input === 'string' ? input : (input as Request).url ?? '';
  if (url.includes('/weatherforecast') || url.includes('/api/forecasts')) {
    return {
      ok: true,
      status: 200,
      json: async () => [{ date: '2025-01-01', temperatureC: 10, summary: 'Clear' }]
    } as unknown as Response;
  }
  return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
});