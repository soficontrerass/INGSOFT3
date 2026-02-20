"use strict";
describe('index bootstrap (index.ts)', () => {
    let useMock;
    let getMock;
    let listenMock;
    let existsSyncMock;
    beforeEach(() => {
        jest.resetModules();
        useMock = jest.fn();
        getMock = jest.fn();
        listenMock = jest.fn();
        existsSyncMock = jest.fn();
        // provide mocks before requiring index
        jest.doMock('../app', () => ({ __esModule: true, default: { use: useMock, get: getMock, listen: listenMock } }));
        jest.doMock('fs', () => ({ existsSync: existsSyncMock }));
        jest.doMock('path', () => ({ resolve: (..._args) => '/fake/client/dist', join: (...args) => args.join('/') }));
    });
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        // ensure mocks removed for next tests
        jest.dontMock('../app');
        jest.dontMock('fs');
        jest.dontMock('path');
        delete process.env.NODE_ENV;
    });
    it('registers static, SPA fallback and starts listen when client dist exists', () => {
        existsSyncMock.mockReturnValue(true);
        process.env.NODE_ENV = 'development';
        jest.isolateModules(() => {
            // require triggers the bootstrap code
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('../index');
        });
        expect(useMock).toHaveBeenCalled();
        expect(getMock).toHaveBeenCalled();
        expect(listenMock).toHaveBeenCalled();
    });
    it('adds root redirect in production when no dist', () => {
        existsSyncMock.mockReturnValue(false);
        process.env.NODE_ENV = 'production';
        jest.isolateModules(() => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('../index');
        });
        expect(getMock).toHaveBeenCalledWith('/', expect.any(Function));
        expect(getMock).toHaveBeenCalledWith('/weatherforecast', expect.any(Function));
    });
});
