import { afterEach, test, expect } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import App from '../App';

afterEach(() => { cleanup(); });

test('App renders heading and list from API', async () => {
  render(<App />);

  expect(screen.getByText(/Weather Forecast/i)).toBeInTheDocument();

  await waitFor(() => expect(screen.getByText(/Sunny/i)).toBeInTheDocument());
  expect(screen.getByText(/Cloudy/i)).toBeInTheDocument();
});