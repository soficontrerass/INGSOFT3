// ...existing code...
jest.resetModules();
jest.clearAllMocks();
delete process.env.NODE_ENV;
delete process.env.CLIENT_URL;
delete process.env.PORT;
delete process.env.FORECAST_COUNT;

test('non-production registers root handler that sends message and listens on default port 8080', async () => {
  await jest.isolateModulesAsync(async () => {
    let rootHandler: Function | undefined;
    const server: any = {
      get: (path: string, handler: Function) => { if (path === '/') rootHandler = handler; },
      listen: jest.fn((port: number, cb?: () => void) => { if (cb) cb(); return server; }),
      on: jest.fn(),
    };

    // ensure client dist is absent so handler uses res.send(...)
    jest.doMock('fs', () => ({ existsSync: () => false }));
    jest.doMock('../app', () => server);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../index');

    expect(rootHandler).toBeDefined();
    const mockRes: any = { send: jest.fn(), sendFile: jest.fn() };
    rootHandler!({} as any, mockRes);
    expect(mockRes.send).toHaveBeenCalledWith('Server running. Use the client UI to interact.');

    expect(server.listen).toHaveBeenCalledWith(8080, expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith(
      `Server listening on port 8080 (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`
    );

    logSpy.mockRestore();
  });
});
// ...existing code...