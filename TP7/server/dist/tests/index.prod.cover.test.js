"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
});
test('index registers production root handler that calls res.redirect', async () => {
    await jest.isolateModulesAsync(async () => {
        process.env.NODE_ENV = 'production';
        process.env.CLIENT_URL = 'https://example.test/';
        let rootHandler;
        const server = {
            get: (path, handler) => { if (path === '/')
                rootHandler = handler; },
            listen: jest.fn((port, cb) => { if (cb)
                cb(); return server; }),
            on: jest.fn(),
        };
        jest.doMock('../app', () => server);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../index');
        expect(rootHandler).toBeDefined();
        const mockRes = { redirect: jest.fn(), send: jest.fn() };
        rootHandler({}, mockRes);
        expect(mockRes.redirect).toHaveBeenCalledWith(process.env.CLIENT_URL);
        // cleanup
        delete process.env.NODE_ENV;
        delete process.env.CLIENT_URL;
    });
});
