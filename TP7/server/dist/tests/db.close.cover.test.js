"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
});
test('db.close calls pool.end when pool exists', async () => {
    await jest.isolateModulesAsync(async () => {
        // ensure module reads a DB config so getPool creates Pool instead of throwing
        process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
        const end = jest.fn().mockResolvedValue(undefined);
        const query = jest.fn().mockResolvedValue({ rows: [] });
        const Pool = jest.fn().mockImplementation(() => ({ query, end }));
        jest.doMock('pg', () => ({ Pool }));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const db = require('../db');
        // call query to force pool creation
        await db.query('SELECT 1');
        expect(Pool).toHaveBeenCalled();
        await db.close();
        expect(end).toHaveBeenCalled();
        // cleanup
        delete process.env.DATABASE_URL;
    });
});
// ...existing code...
