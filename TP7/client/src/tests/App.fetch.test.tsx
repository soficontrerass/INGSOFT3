import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../App';

describe('App fetch flows', () => {
  let mockedFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockedFetch = vi.fn();
    vi.stubGlobal('fetch', mockedFetch as unknown as typeof fetch);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows loading then renders fetched items', async () => {
    const mockData = [{ date: '2025-12-01T00:00:00Z', temperatureC: 20, summary: 'Sunny' }];
    mockedFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/favorites')) {
        return { ok: true, json: async () => [] } as Response;
      }
      if (url.includes('/api/searches')) {
        return { ok: true, json: async () => [] } as Response;
      }
      if (url.includes('/weatherforecast')) {
        return { ok: true, json: async () => mockData } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    render(<App />);

    expect(screen.getByText(/Loading forecast/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText(/Loading forecast/i)).not.toBeInTheDocument());

    expect(screen.getByText(/Sunny/)).toBeInTheDocument();
    expect(screen.getByText(/20°C/)).toBeInTheDocument();
  });

  it('shows error when response not ok', async () => {
    mockedFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/favorites')) {
        return { ok: true, json: async () => [] } as Response;
      }
      if (url.includes('/api/searches')) {
        return { ok: true, json: async () => [] } as Response;
      }
      if (url.includes('/weatherforecast')) {
        return { ok: false, status: 500, json: async () => ({}) } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Error:/i)).toBeInTheDocument());
    expect(screen.getByText(/HTTP 500/)).toBeInTheDocument();
  });

  it('shows error when fetch rejects', async () => {
    mockedFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/favorites')) {
        return { ok: true, json: async () => [] } as Response;
      }
      if (url.includes('/api/searches')) {
        return { ok: true, json: async () => [] } as Response;
      }
      if (url.includes('/weatherforecast')) {
        throw new Error('network');
      }
      return { ok: true, json: async () => [] } as Response;
    });
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Error:/i)).toBeInTheDocument());
    expect(screen.getByText(/network/)).toBeInTheDocument();
  });
});
