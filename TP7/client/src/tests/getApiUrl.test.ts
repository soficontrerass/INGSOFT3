import { vi } from 'vitest';

vi.resetModules();

describe('getApiUrl', () => {
  const ORIGINAL_ENV = { ...process.env };
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  test('returns process.env VITE_API_URL when import.meta not available', async () => {
    process.env.VITE_API_URL = 'http://from-process';
    const { getApiUrl } = await import('../utils/getApiUrl');
    expect(getApiUrl()).toBe('http://from-process');
  });

  test('returns default when no env provided', async () => {
    delete process.env.VITE_API_URL;
    const { getApiUrl } = await import('../utils/getApiUrl');
    expect(getApiUrl()).toBe('http://localhost:8080');
  });
});