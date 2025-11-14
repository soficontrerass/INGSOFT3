import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

describe('App fetch flows', () => {
  let mockedFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockedFetch = vi.fn();
    vi.stubGlobal('fetch', mockedFetch as unknown as typeof fetch);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading then renders fetched items', async () => {
    const mockData = [{ date: '2025-12-01T00:00:00Z', temperatureC: 20, summary: 'Sunny' }];
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    render(<App />);

    expect(screen.getByText(/Cargando.../i)).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText(/Cargando.../i)).not.toBeInTheDocument());

    expect(screen.getByText(/Sunny/)).toBeInTheDocument();
    expect(screen.getByText(/20°C/)).toBeInTheDocument();
  });

  it('shows error when response not ok', async () => {
    mockedFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Error:/i)).toBeInTheDocument());
    expect(screen.getByText(/HTTP 500/)).toBeInTheDocument();
  });

  it('shows error when fetch rejects', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('network'));
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Error:/i)).toBeInTheDocument());
    expect(screen.getByText(/network/)).toBeInTheDocument();
  });
});