jest.resetModules();

describe('db module behavior by env config', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('db.query resolves when DATABASE_URL is set', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';

    await jest.isolateModules(async () => {
      jest.doMock('pg', () => {
        function MockPool() {}
        MockPool.prototype.query = async function () { return { rows: [{ ok: true }] }; };
        MockPool.prototype.end = async function () { return; };
        return { Pool: MockPool };
      }, { virtual: true });

      const db = require('../db');
      await expect(db.query('SELECT 1')).resolves.toEqual({ rows: [{ ok: true }] });

      jest.dontMock('pg');
    });
  });

  test('db.query resolves when DB_* env vars are set', async () => {
    delete process.env.DATABASE_URL;
    process.env.DB_USER = 'u';
    process.env.DB_PASS = 'p';
    process.env.DB_NAME = 'mydb';
    process.env.DB_HOST = 'dbhost';
    process.env.DB_PORT = '5433';

    await jest.isolateModules(async () => {
      jest.doMock('pg', () => {
        function MockPool() {}
        MockPool.prototype.query = async function () { return { rows: [{ ok: true }] }; };
        MockPool.prototype.end = async function () { return; };
        return { Pool: MockPool };
      }, { virtual: true });

      const db = require('../db');
      await expect(db.query('SELECT 1')).resolves.toEqual({ rows: [{ ok: true }] });

      jest.dontMock('pg');
    });
  });

  test('db.query rejects when no DB configuration present', async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DB_NAME;
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_PASS;
    delete process.env.DB_PORT;

    await jest.isolateModules(async () => {
      const db = require('../db');
      await expect(db.query('SELECT 1')).rejects.toThrow(/No database configuration found/i);
    });
  });
});