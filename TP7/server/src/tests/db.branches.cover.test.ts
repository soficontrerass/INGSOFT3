export {};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  delete process.env.DATABASE_URL;
  delete process.env.DB_HOST;
  delete process.env.DB_NAME;
  delete process.env.DB_USER;
  delete process.env.DB_PASS;
  delete process.env.DB_PORT;
});

test('uses DATABASE_URL when provided', async () => {
  await jest.isolateModulesAsync(async () => {
    process.env.DATABASE_URL = 'postgres://u:p@localhost:5432/db';
    const end = jest.fn().mockResolvedValue(undefined);
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const Pool = jest.fn().mockImplementation((opts: any) => {
      expect(opts).toHaveProperty('connectionString', process.env.DATABASE_URL);
      return { query, end };
    });

    jest.doMock('pg', () => ({ Pool }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const db = require('../db');

    await db.query('SELECT 1');
    expect(Pool).toHaveBeenCalled();
    await db.close();
    expect(end).toHaveBeenCalled();

    delete process.env.DATABASE_URL;
  });
});

test('uses DB_* env vars and parses DB_PORT as number', async () => {
  await jest.isolateModulesAsync(async () => {
    process.env.DB_HOST = 'dbhost';
    process.env.DB_NAME = 'dbname';
    process.env.DB_USER = 'userx';
    process.env.DB_PASS = 'passx';
    process.env.DB_PORT = '5433';

    const end = jest.fn().mockResolvedValue(undefined);
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const Pool = jest.fn().mockImplementation((opts: any) => {
      expect(opts).toMatchObject({
        user: 'userx',
        password: 'passx',
        database: 'dbname',
        host: 'dbhost',
      });
      // port must be a number (cover parseInt branch)
      expect(typeof opts.port).toBe('number');
      expect(opts.port).toBe(5433);
      return { query, end };
    });

    jest.doMock('pg', () => ({ Pool }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const db = require('../db');

    await db.query('SELECT 1');
    expect(Pool).toHaveBeenCalled();

    await db.close();
    expect(end).toHaveBeenCalled();

    delete process.env.DB_HOST;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASS;
    delete process.env.DB_PORT;
  });
});

test('throws when no DB configuration present', async () => {
  await jest.isolateModulesAsync(async () => {
    // ensure no env vars
    delete process.env.DATABASE_URL;
    delete process.env.DB_HOST;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASS;
    delete process.env.DB_PORT;

    // mock pg to avoid real import side-effects
    jest.doMock('pg', () => ({ Pool: jest.fn() }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const db = require('../db');

    await expect(db.query('SELECT 1')).rejects.toThrow(
      /No database configuration found/i
    );
  });
});