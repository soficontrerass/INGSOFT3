// ...existing code...
export {};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('index registers non-production root handler that calls res.send', async () => {
  await jest.isolateModulesAsync(async () => {
    // ensure not production
    delete process.env.NODE_ENV;

    let rootHandler: Function | undefined;
    const server: any = {
      get: (path: string, handler: Function) => { if (path === '/') rootHandler = handler; },
      listen: jest.fn((port: number, cb?: () => void) => { if (cb) cb(); return server; }),
      on: jest.fn(),
    };

    // mock the app module as seen by require('../index') (test file is in src/tests)
    jest.doMock('../app', () => server);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../index');

    expect(rootHandler).toBeDefined();

    const mockRes: any = { send: jest.fn(), redirect: jest.fn() };
    rootHandler!({} as any, mockRes);
    expect(mockRes.send).toHaveBeenCalledWith('Server running. Use the client UI to interact.');
  });
});
// ...existing code...