jest.resetModules();

// mockear db con query y close (migrate llama a close en tu código)
jest.mock('../db', () => ({ query: jest.fn(), close: jest.fn() }));
import { query, close } from '../db';

describe('migrate', () => {
  it('runs migrations and calls db.query and db.close', async () => {
    (query as jest.Mock).mockResolvedValueOnce({});
    // require migrate después de mockear db
    const migrate = require('../migrate');

    if (typeof migrate.runMigrations === 'function') {
      await expect(migrate.runMigrations()).resolves.not.toThrow();
      expect(query).toHaveBeenCalled();
      // si migrate llama a close al final
      expect(close).toHaveBeenCalled();
    } else if (typeof migrate.default === 'function') {
      await expect(migrate.default()).resolves.not.toThrow();
      expect(query).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    } else {
      // si ejecuta en import
      expect(query).toHaveBeenCalled();
    }
  });
});