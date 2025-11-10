import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders app', () => {
  render(<App />);
  // busca un texto o elemento que tu App siempre renderice
  expect(document.body).toBeTruthy();
});