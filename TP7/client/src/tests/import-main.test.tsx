import '../setupTests';
import { afterEach, test, expect } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import App from '../main';

afterEach(() => { cleanup(); });

test('import main bootstraps the app (counts main.tsx)', async () => {
  render(<App />);

  // título debe aparecer inmediatamente
  expect(screen.getByText(/TP5 - Weather Forecast/i)).toBeInTheDocument();

  // esperar la lista generada por el fetch stub
  await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());
});