describe('index.ts extra branches (CLIENT_DIST present / SPA fallback)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  it('serves index.html (res.sendFile) when CLIENT_DIST exists', () => {
    const handlers: Record<string, Function> = {};
    const server: any = {
      use: jest.fn(),
      get: (p: string, h: Function) => { handlers[p] = h; },
      listen: jest.fn((port: number, cb?: () => void) => { if (cb) cb(); return server; }),
      on: jest.fn(),
    };

    // make index think client dist exists and path.resolve predictable
    jest.doMock('fs', () => ({ existsSync: () => true }));
    jest.doMock('path', () => ({ resolve: (..._a: any[]) => '/fake/client/dist', join: (...a: any[]) => a.join('/') }));
    jest.doMock('../app', () => server);

    // require triggers bootstrap
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../index');

    // root handler should be registered
    const rootHandler = handlers['/'];
    expect(rootHandler).toBeDefined();

    const mockRes: any = { sendFile: jest.fn(), send: jest.fn(), redirect: jest.fn() };
    rootHandler!({} as any, mockRes);
    expect(mockRes.sendFile).toHaveBeenCalledWith('/fake/client/dist/index.html');
  });

  it('SPA fallback "*" returns index.html via sendFile', () => {
    const handlers: Record<string, Function> = {};
    const server: any = {
      use: jest.fn(),
      get: (p: string, h: Function) => { handlers[p] = h; },
      listen: jest.fn((port: number, cb?: () => void) => { if (cb) cb(); return server; }),
      on: jest.fn(),
    };

    jest.doMock('fs', () => ({ existsSync: () => true }));
    jest.doMock('path', () => ({ resolve: (..._a: any[]) => '/fake/client/dist', join: (...a: any[]) => a.join('/') }));
    jest.doMock('../app', () => server);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../index');

    const starHandler = handlers['*'];
    expect(starHandler).toBeDefined();

    const mockReq: any = { path: '/some/route' };
    const mockRes: any = { sendFile: jest.fn() };
    starHandler!(mockReq, mockRes);
    expect(mockRes.sendFile).toHaveBeenCalledWith('/fake/client/dist/index.html');
  });
});