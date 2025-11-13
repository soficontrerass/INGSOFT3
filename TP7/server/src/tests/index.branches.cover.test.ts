export {};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  delete process.env.NODE_ENV;
  delete process.env.CLIENT_URL;
  delete process.env.PORT;
  delete process.env.FORECAST_COUNT;
});

test('non-production registers root handler that sends message and listens on default port 8080', async () => {
  await jest.isolateModulesAsync(async () => {
    let rootHandler: Function | undefined;
    const server: any = {
      get: (path: string, handler: Function) => { if (path === '/') rootHandler = handler; },
      listen: jest.fn((port: number, cb?: () => void) => { if (cb) cb(); return server; }),
      on: jest.fn(),
    };

    jest.doMock('../app', () => server);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../index');

    expect(rootHandler).toBeDefined();
    const mockRes: any = { send: jest.fn() };
    rootHandler!({} as any, mockRes);
    expect(mockRes.send).toHaveBeenCalledWith('Server running. Use the client UI to interact.');

    expect(server.listen).toHaveBeenCalledWith(8080, expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith(
      `Server listening on port 8080 (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`
    );

    logSpy.mockRestore();
  });
});

test('production registers root handler that redirects to CLIENT_URL', async () => {
  await jest.isolateModulesAsync(async () => {
    process.env.NODE_ENV = 'production';
    process.env.CLIENT_URL = 'https://example.test/';

    let rootHandler: Function | undefined;
    const server: any = {
      get: (path: string, handler: Function) => { if (path === '/') rootHandler = handler; },
      listen: jest.fn((port: number, cb?: () => void) => { if (cb) cb(); return server; }),
      on: jest.fn(),
    };

    jest.doMock('../app', () => server);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../index');

    expect(rootHandler).toBeDefined();
    const mockRes: any = { redirect: jest.fn() };
    rootHandler!({} as any, mockRes);
    expect(mockRes.redirect).toHaveBeenCalledWith(process.env.CLIENT_URL);

    delete process.env.NODE_ENV;
    delete process.env.CLIENT_URL;
  });
});

test('uses provided PORT env and logs it (covers Number(process.env.PORT) branch)', async () => {
  await jest.isolateModulesAsync(async () => {
    process.env.PORT = '3001';
    process.env.FORECAST_COUNT = '7';

    let rootHandler: Function | undefined;
    const server: any = {
      get: (path: string, handler: Function) => { if (path === '/') rootHandler = handler; },
      listen: jest.fn((port: number, cb?: () => void) => { if (cb) cb(); return server; }),
      on: jest.fn(),
    };

    jest.doMock('../app', () => server);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../index');

    expect(server.listen).toHaveBeenCalledWith(3001, expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith(
      `Server listening on port 3001 (FORECAST_COUNT=7)`
    );

    logSpy.mockRestore();
    delete process.env.PORT;
    delete process.env.FORECAST_COUNT;
  });
});