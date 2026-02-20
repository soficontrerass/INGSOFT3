"use strict";
// ...existing code...
jest.resetModules();
jest.clearAllMocks();
test('index registers non-production root handler that calls res.send', async () => {
    await jest.isolateModulesAsync(async () => {
        // ensure not production
        delete process.env.NODE_ENV;
        let rootHandler;
        const server = {
            get: (path, handler) => { if (path === '/')
                rootHandler = handler; },
            listen: jest.fn((port, cb) => { if (cb)
                cb(); return server; }),
            on: jest.fn(),
        };
        // mock fs so CLIENT_DIST is considered absent -> code will call res.send(...)
        jest.doMock('fs', () => ({ existsSync: () => false }));
        jest.doMock('../app', () => server);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../index');
        expect(rootHandler).toBeDefined();
        const mockRes = { send: jest.fn(), redirect: jest.fn(), sendFile: jest.fn() };
        rootHandler({}, mockRes);
        expect(mockRes.send).toHaveBeenCalledWith('Server running. Use the client UI to interact.');
    });
});
// ...existing code...
