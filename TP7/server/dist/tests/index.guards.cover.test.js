"use strict";
describe('index.ts guard branches when app methods are missing', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        delete process.env.NODE_ENV;
    });
    it('does not throw when app has no use/get/listen', () => {
        jest.doMock('../app', () => ({ __esModule: true, default: {} }));
        jest.doMock('fs', () => ({ existsSync: () => true }));
        jest.doMock('path', () => ({
            resolve: (..._args) => '/fake/client/dist',
            join: (...args) => args.join('/'),
        }));
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('../index');
        }).not.toThrow();
    });
});
