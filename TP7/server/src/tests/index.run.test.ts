export {}; // ensure this file is treated as a module to avoid global scope collisions

// ...existing code...
jest.resetModules();

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  jest.resetModules();
  jest.clearAllMocks();
});
// ...existing code...
jest.resetModules();

// evita dependencias a NodeJS types en el editor
test('startServer via RUN_SERVER with PORT=0 creates serverInstance (spy listen)', () => {
  process.env.RUN_SERVER = 'true';
  process.env.PORT = '0';

  jest.isolateModules(() => {
    // cargar app real
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require('../app').default;

    // espiar listen sin errores de tipo en cb/cb2
    const mockListen = jest.spyOn(app, 'listen').mockImplementation((port: any, cb?: any) => {
      if (cb) cb();
      return { close: (cb2?: any) => { if (cb2) cb2(); }, address: () => ({ port }) } as any;
    });

    // require index (arrancará porque RUN_SERVER=true)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const idx = require('../index');

    expect(mockListen).toHaveBeenCalledWith(0, expect.any(Function));
    expect(idx.serverInstance).toBeDefined();

    // cleanup
    if (idx.serverInstance && typeof idx.serverInstance.close === 'function') idx.serverInstance.close(() => {});
    mockListen.mockRestore();
  });
});

test('startServer default port 8080 branch (spy listen)', () => {
  process.env.RUN_SERVER = 'true';
  delete process.env.PORT;

  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require('../app').default;

    const mockListen = jest.spyOn(app, 'listen').mockImplementation((port: any, cb?: any) => {
      if (cb) cb();
      return { close: (cb2?: any) => { if (cb2) cb2(); }, address: () => ({ port }) } as any;
    });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const idx = require('../index');

    expect(mockListen).toHaveBeenCalledWith(8080, expect.any(Function));
    expect(idx.serverInstance).toBeDefined();

    if (idx.serverInstance && typeof idx.serverInstance.close === 'function') idx.serverInstance.close(() => {});
    mockListen.mockRestore();
  });
});
// ...existing code...