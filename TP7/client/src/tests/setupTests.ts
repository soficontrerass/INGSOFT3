// ...existing code...
import '@testing-library/jest-dom';

const originalFetch = (globalThis as any).fetch;

(globalThis as any).fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : (input as Request).url;
  if (url.includes('/weatherforecast')) {
    const data = [
      { date: new Date().toISOString(), temperatureC: 20, summary: 'Sunny' },
      { date: new Date(Date.now() + 86400000).toISOString(), temperatureC: 18, summary: 'Cloudy' },
    ];
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (originalFetch) return originalFetch(input as any, init);
  return new Response(null, { status: 404 });
};
// ...existing code...