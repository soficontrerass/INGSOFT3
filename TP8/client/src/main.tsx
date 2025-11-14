import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';

export function mountRoot(rootEl = document.getElementById('root')): Root | undefined {
  if (!rootEl) return;
  const root = createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  return root;
}

if (typeof window !== 'undefined') {
  if (document.readyState !== 'loading') {
    mountRoot();
  } else {
    window.addEventListener('DOMContentLoaded', () => mountRoot());
  }
}