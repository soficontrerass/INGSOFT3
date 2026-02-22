"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.exitCode;
});
async function waitForAsync() {
    await new Promise((r) => setImmediate(r));
}
test('successful migration calls query(sql) then close()', async () => {
    await jest.isolateModulesAsync(async () => {
        const sql001 = 'CREATE TABLE t1();';
        const sql002 = 'CREATE TABLE t2();';
        const dbQuery = jest.fn().mockResolvedValue(undefined);
        const dbClose = jest.fn().mockResolvedValue(undefined);
        jest.doMock('../db', () => ({ __esModule: true, query: dbQuery, close: dbClose }));
        jest.doMock('fs', () => ({
            readdirSync: jest.fn().mockReturnValue(['002_searches_favorites_cache.sql', '001_init.sql']),
            readFileSync: jest
                .fn()
                .mockReturnValueOnce(sql001)
                .mockReturnValueOnce(sql002),
        }));
        require('../migrate');
        await waitForAsync();
        expect(dbQuery).toHaveBeenNthCalledWith(1, sql001);
        expect(dbQuery).toHaveBeenNthCalledWith(2, sql002);
        expect(dbClose).toHaveBeenCalled();
        expect(process.exitCode).toBeUndefined();
    });
});
test('query throws -> logs error, close() still called and process.exitCode = 1', async () => {
    await jest.isolateModulesAsync(async () => {
        const sql = 'CREATE TABLE t();';
        const dbQuery = jest.fn().mockRejectedValue(new Error('boom'));
        const dbClose = jest.fn().mockResolvedValue(undefined);
        jest.doMock('../db', () => ({ __esModule: true, query: dbQuery, close: dbClose }));
        jest.doMock('fs', () => ({
            readdirSync: jest.fn().mockReturnValue(['001_init.sql']),
            readFileSync: jest.fn().mockReturnValue(sql),
        }));
        require('../migrate');
        await waitForAsync();
        expect(dbQuery).toHaveBeenCalled();
        expect(dbClose).toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });
});
test('readFileSync throws -> query not called, close() called and process.exitCode = 1', async () => {
    await jest.isolateModulesAsync(async () => {
        const dbQuery = jest.fn();
        const dbClose = jest.fn().mockResolvedValue(undefined);
        jest.doMock('../db', () => ({ __esModule: true, query: dbQuery, close: dbClose }));
        jest.doMock('fs', () => ({
            readdirSync: jest.fn().mockReturnValue(['001_init.sql']),
            readFileSync: jest.fn(() => { throw new Error('nofile'); }),
        }));
        require('../migrate');
        await waitForAsync();
        expect(dbQuery).not.toHaveBeenCalled();
        expect(dbClose).toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });
});
// ...existing code...
