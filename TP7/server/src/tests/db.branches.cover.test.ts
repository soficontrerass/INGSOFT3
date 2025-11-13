export {};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  // limpiar env
  delete process.env.DATABASE_URL;
  delete process.env.DB_NAME;
  delete process.env.DB_HOST;
  delete process.env.DB_USER;
  delete process.env.DB_PASS;
  delete process.env.DB_PORT;
});

test('uses DATABASE_URL -> Pool constructed with connectionString and query/close work', async () => {
  await jest.isolateModulesAsync(async () => {
    const poolQuery = jest.fn().mockResolvedValue({ rows: [] });
    const poolEnd = jest.fn().mockResolvedValue(undefined);
    const Pool = jest.fn().mockImplementation((opts: any) => {
      return { query: poolQuery, end: poolEnd };
    });

    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';

    jest.doMock('pg', () => ({ Pool }));
    const db = require('../db');

    await expect(db.query('SELECT 1')).resolves.toEqual({ rows: [] });
    expect(Pool).toHaveBeenCalledWith({ connectionString: process.env.DATABASE_URL });
    expect(poolQuery).toHaveBeenCalledWith('SELECT 1', undefined);

    await db.close();
    expect(poolEnd).toHaveBeenCalled();
  });
});

test('uses DB_NAME/DB_HOST envs -> Pool constructed with host/user/pass/port and close works', async () => {
  await jest.isolateModulesAsync(async () => {
    const poolQuery = jest.fn().mockResolvedValue({ rows: [] });
    const poolEnd = jest.fn().mockResolvedValue(undefined);
    const Pool = jest.fn().mockImplementation((opts: any) => {
      return { query: poolQuery, end: poolEnd };
    });

    process.env.DB_NAME = 'mydb';
    process.env.DB_HOST = 'db.example';
    process.env.DB_USER = 'u';
    process.env.DB_PASS = 'p';
    process.env.DB_PORT = '5433';

    jest.doMock('pg', () => ({ Pool }));
    const db = require('../db');

    await expect(db.query('SELECT 2')).resolves.toEqual({ rows: [] });
    expect(Pool).toHaveBeenCalledWith({
      user: 'u',
      password: 'p',
      database: 'mydb',
      host: 'db.example',
      port: 5433,
    });
    expect(poolQuery).toHaveBeenCalledWith('SELECT 2', undefined);

    await db.close();
    expect(poolEnd).toHaveBeenCalled();
  });
});

test('no envs -> getPool throws and query rejects with error', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('pg', () => ({ Pool: jest.fn() }));

    const db = require('../db');

    await expect(db.query('SELECT 3')).rejects.toThrow(/No database configuration found/);
    await expect(db.close()).resolves.toBeUndefined();
  });
});