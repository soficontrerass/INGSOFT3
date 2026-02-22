import '../setupTests';
import { afterEach, test, expect, vi } from 'vitest';
import { waitFor, screen } from '@testing-library/react';
import { act } from 'react';

// <-- Insert: mock deterministic de Math.random para tests (evita Security Hotspot) -->
beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
});

let createdEls: HTMLElement[] = [];

afterEach(() => {
  for (const el of createdEls) {
    if (el.parentNode) el.parentNode.removeChild(el);
  }
  createdEls = [];
  vi.restoreAllMocks();
  vi.resetModules();
});

test('mountRoot renders App into provided element', async () => {
  vi.resetModules();
  const id = `root-${Math.random().toString(36).slice(2)}`;
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  createdEls.push(el);

  const mod = await import('../main');
  act(() => {
    mod.mountRoot(el);
  });

  await waitFor(() => expect(screen.getByText(/Weather Forecast/i)).toBeInTheDocument());
  expect(el.innerHTML.length).toBeGreaterThan(0);
});

test('mountRoot handles missing root element gracefully', async () => {
  const mod = await import('../main');
  act(() => {
    expect(() => mod.mountRoot(undefined as unknown as HTMLElement)).not.toThrow();
  });
});

test('adds DOMContentLoaded listener and mounts when event fires (coverage)', async () => {
  vi.resetModules();
  const originalReadyState = document.readyState;
  Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });

  const el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);
  createdEls.push(el);

  await import('../main');

  act(() => {
    window.dispatchEvent(new Event('DOMContentLoaded'));
  });

  await waitFor(() => expect(screen.getByText(/Weather Forecast/i)).toBeInTheDocument());

  Object.defineProperty(document, 'readyState', { value: originalReadyState, configurable: true });
});