import '../setupTests';
import { afterEach, test, expect, vi } from 'vitest';
import { waitFor, screen } from '@testing-library/react';
import { act } from 'react';

afterEach(() => {
  const root = document.getElementById('root');
  if (root && root.parentNode) root.parentNode.removeChild(root);
  vi.restoreAllMocks();
  vi.resetModules();
});

test('adds DOMContentLoaded listener and mounts when event fires', async () => {
  // limpiar cache y simular estado de carga
  vi.resetModules();
  const originalReadyState = document.readyState;
  Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });

  // crear root ANTES de importar main para que el listener lo encuentre
  const el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);

  // importar main (añade listener)
  await import('../main');

  // disparar evento dentro de act para envolver actualizaciones de React
  act(() => {
    window.dispatchEvent(new Event('DOMContentLoaded'));
  });

  await waitFor(() => expect(screen.getByText(/TP5 - Weather Forecast/i)).toBeInTheDocument());

  Object.defineProperty(document, 'readyState', { value: originalReadyState, configurable: true });
});