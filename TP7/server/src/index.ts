// ...existing code...
import app from './app';

export let serverInstance: ReturnType<typeof app.listen> | undefined;

export function startServer() {
  const port = process.env.PORT ? Number(process.env.PORT) : 8080;
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port} (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`);
  });
  serverInstance = server;
  return server;
}

// start only when run directly or when tests explicitly request it
if (require.main === module || process.env.RUN_SERVER === 'true') {
  startServer();
}
// ...existing code...