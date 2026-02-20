"use strict";
jest.resetModules();
process.env.DATABASE_URL = 'postgres://user:pass@localhost/testdb';
jest.mock('pg', () => {
    // pool compartido accesible desde el mock para el test
    const pool = { query: jest.fn() };
    const Pool = jest.fn(() => pool);
    return { Pool, __pool: pool, __esModule: true };
});
describe('db.query', () => {
    it('forwards query to pg Pool and returns rows', async () => {
        const { query } = require('../db'); // importa después del mock
        const pg = require('pg');
        const pool = pg.__pool;
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const res = await query('SELECT 1');
        expect(pool.query).toHaveBeenCalledWith('SELECT 1', undefined);
        expect(res.rows).toEqual([{ id: 1 }]);
    });
    it('throws when underlying pool query rejects', async () => {
        const { query } = require('../db');
        const pg = require('pg');
        const pool = pg.__pool;
        pool.query.mockRejectedValueOnce(new Error('fail'));
        await expect(query('SELECT 1')).rejects.toThrow('fail');
    });
});
