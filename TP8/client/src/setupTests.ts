import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Stub global fetch para tests (ajustá la respuesta según tu API)
vi.stubGlobal('fetch', async (input: RequestInfo) => {
  const url = typeof input === 'string' ? input : (input as Request).url ?? '';
  if (url.includes('/weatherforecast') || url.includes('/api/forecasts')) {
    return {
      ok: true,
      status: 200,
      json: async () => [
        { date: new Date().toISOString(), temperatureC: 20, summary: 'Sunny' },
        { date: new Date(Date.now() + 86400000).toISOString(), temperatureC: 18, summary: 'Cloudy' }
      ],
    } as unknown as Response;
  }
  return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
});