"use strict";
describe('index.ts extra branches (CLIENT_DIST present / SPA fallback)', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        delete process.env.NODE_ENV;
    });
    it('serves index.html (res.sendFile) when CLIENT_DIST exists', () => {
        const handlers = {};
        const server = {
            use: jest.fn(),
            get: (p, h) => { handlers[p] = h; },
            listen: jest.fn((port, cb) => { if (cb)
                cb(); return server; }),
            on: jest.fn(),
        };
        // make index think client dist exists and path.resolve predictable
        jest.doMock('fs', () => ({ existsSync: () => true }));
        jest.doMock('path', () => ({ resolve: (..._a) => '/fake/client/dist', join: (...a) => a.join('/') }));
        jest.doMock('../app', () => server);
        // require triggers bootstrap
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../index');
        // root handler should be registered
        const rootHandler = handlers['/'];
        expect(rootHandler).toBeDefined();
        const mockRes = { sendFile: jest.fn(), send: jest.fn(), redirect: jest.fn() };
        rootHandler({}, mockRes);
        expect(mockRes.sendFile).toHaveBeenCalledWith('/fake/client/dist/index.html');
    });
    it('SPA fallback "*" returns index.html via sendFile', () => {
        const handlers = {};
        const server = {
            use: jest.fn(),
            get: (p, h) => { handlers[p] = h; },
            listen: jest.fn((port, cb) => { if (cb)
                cb(); return server; }),
            on: jest.fn(),
        };
        jest.doMock('fs', () => ({ existsSync: () => true }));
        jest.doMock('path', () => ({ resolve: (..._a) => '/fake/client/dist', join: (...a) => a.join('/') }));
        jest.doMock('../app', () => server);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../index');
        const starHandler = handlers['*'];
        expect(starHandler).toBeDefined();
        const mockReq = { path: '/some/route' };
        const mockRes = { sendFile: jest.fn() };
        starHandler(mockReq, mockRes);
        expect(mockRes.sendFile).toHaveBeenCalledWith('/fake/client/dist/index.html');
    });
});
