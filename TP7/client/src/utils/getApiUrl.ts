export function getApiUrl(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any)?.env;
    if (env?.VITE_API_URL) return env.VITE_API_URL;
  } catch {
    // ignore
  }
  // fallback to process.env for test/node environments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (process.env as any).VITE_API_URL || 'http://localhost:8080';
}