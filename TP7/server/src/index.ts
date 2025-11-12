// ...existing code...
import app from './app';

/**
 * Export a const wrapper object so the exported binding is a const (Sonar)
 * while tests can still call .close(...) / .address().
 */
export const serverInstance: any = {}; // properties will be attached when server starts

export function startServer() {
  const port = process.env.PORT ? Number(process.env.PORT) : 8080;
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port} (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`);
  });

  // copy runtime methods onto the exported wrapper so existing consumers/tests keep working
  serverInstance.close = server.close && server.close.bind(server);
  serverInstance.address = server.address && server.address.bind(server);
  // keep a reference to the real server if needed
  serverInstance.__server = server;

  return server;
}

// start only when run directly or when tests explicitly request it
if (require.main === module || process.env.RUN_SERVER === 'true') {
  startServer();
}
// ...existing code...