// ...existing code...
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// (No redundant assertions here.)
vi.stubGlobal('fetch', async (input: RequestInfo) => {
  const url = typeof input === 'string' ? input : (input as Request).url ?? '';
  if (url.includes('/api/forecasts') || url.includes('/weatherforecast')) {
    return {
      ok: true,
      status: 200,
      json: async () => [{ id: 1, created_at: '2025-01-01', value: 42 }]
    } as unknown as Response;
  }
  return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
});
// ...existing code...