jest.resetModules();

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  jest.resetModules();
  jest.clearAllMocks();
});

test('db.close calls pool.end when pool exists', async () => {
  // forzar la rama que crea Pool
  process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';

  const endMock = jest.fn().mockResolvedValue(undefined);

  function MockPool() {}
  MockPool.prototype.query = async () => ({ rows: [] });
  MockPool.prototype.end = endMock;

  jest.doMock('pg', () => ({ Pool: MockPool }), { virtual: true });

  // require después de mockear y setear env
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const db = require('../db');

  // forzar creación del pool y cierre
  await db.query('SELECT 1');
  await db.close();

  expect(endMock).toHaveBeenCalled();

  jest.dontMock('pg');
});