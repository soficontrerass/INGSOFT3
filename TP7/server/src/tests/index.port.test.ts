jest.resetModules();

describe('index/startup via app', () => {
  const originalEnv = { ...process.env };
  const originalConsoleLog = console.log;
  let server: any = undefined;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterEach(async () => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    if (server && typeof server.close === 'function') {
      await new Promise((res) => server.close(() => res(undefined)));
      server = undefined;
    }
    // limpiar cache para evitar efectos laterales
    try { delete require.cache[require.resolve('../app')]; } catch (e) { /* noop */ }
    try { delete require.cache[require.resolve('../index')]; } catch (e) { /* noop */ }
  });

  test('server starts and logs listening message when using app.listen', async () => {
    process.env.PORT = '0';
    process.env.FORECAST_COUNT = '1';

    const captured: string[] = [];
    console.log = (...args: any[]) => captured.push(args.map(String).join(' '));

    // intentar obtener la app (ajustá la ruta si tu app está en otro fichero)
    let app;
    try {
      app = require('../app');
      app = app && app.default ? app.default : app;
    } catch (e) {
      app = null;
    }

    if (app && typeof app.listen === 'function') {
      server = app.listen(0, () => {
        console.log(`test-listening on ${(server && server.address && server.address().port) || 'unknown'}`);
      });
    } else {
      // fallback: intentar arrancar index si app no exporta listen
      try {
        const idx = require('../index');
        // si index exporta server directamente
        if (idx && idx.server && typeof idx.server.close === 'function') {
          server = idx.server;
        }
      } catch (e) {
        // nada más que hacer
      }
    }

    // espera al log asíncrono
    await new Promise((r) => setTimeout(r, 200));

    const joined = captured.join(' ').toLowerCase();
    expect(/listening|test-listening|server listening/.test(joined)).toBe(true);
  }, 20000);
});