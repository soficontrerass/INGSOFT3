import { afterEach, test, expect, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import App from '../App';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

test('shows error when fetch fails', async () => {
  // forzar fallo en fetch para cubrir la rama de error
  vi.stubGlobal('fetch', async () => ({ ok: false, status: 500, json: async () => ({}) } as unknown as Response));

  render(<App />);

  await waitFor(() => expect(screen.getByText(/Error:/i)).toBeInTheDocument());
});