"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
});
test('index listen callback logs server start message', async () => {
    await jest.isolateModulesAsync(async () => {
        // configurar puerto y forecast count para mensaje predecible
        process.env.PORT = '3001';
        process.env.FORECAST_COUNT = '7';
        let server;
        server = {
            get: jest.fn(),
            listen: jest.fn((port, cb) => {
                if (cb)
                    cb();
                return server;
            }),
            on: jest.fn(),
        };
        jest.doMock('../app', () => server);
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../index');
        expect(server.listen).toHaveBeenCalledWith(3001, expect.any(Function));
        expect(logSpy).toHaveBeenCalledWith(`Server listening on port 3001 (FORECAST_COUNT=7)`);
        logSpy.mockRestore();
        delete process.env.PORT;
        delete process.env.FORECAST_COUNT;
    });
});
