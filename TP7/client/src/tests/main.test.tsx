import { afterEach, test, expect } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import App from '../App';

afterEach(() => { cleanup(); });

test('App renders heading and list from API', async () => {
  render(<App />);

  // título siempre presente
  expect(screen.getByText(/TP5 - Weather Forecast/i)).toBeInTheDocument();

  // la lista aparece cuando la fetch stub termina
  await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());
  const items = screen.getAllByRole('listitem');
  expect(items.length).toBeGreaterThan(0);
});