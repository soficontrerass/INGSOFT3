jest.resetModules();

test('db.query rejects when pg Pool constructor throws', async () => {
  const ORIGINAL_ENV = { ...process.env };
  try {
    // forzar ruta que crea Pool
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';

    await jest.isolateModules(async () => {
      // mockear pg Pool para que lance al instanciarse
      jest.doMock('pg', () => ({
        Pool: function MockPool() { throw new Error('mock pool failure'); }
      }), { virtual: true });

      // require después de mock
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const db = require('../db');
      await expect(db.query('SELECT 1')).rejects.toThrow(/mock pool failure/i);

      jest.dontMock('pg');
    });
  } finally {
    process.env = ORIGINAL_ENV;
    jest.resetModules();
    jest.clearAllMocks();
  }
});