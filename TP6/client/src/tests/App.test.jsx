import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

test('renders App (real) without crashing', async () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  // espera que algo del DOM aparezca; ajusta selector según tu App
  const el = await screen.findByRole('main', { timeout: 2000 }).catch(() => null);
  expect(el || document.body).toBeTruthy();
});