import path from 'path';
import { promises as fs } from 'fs';
import * as db from './db';

async function runMigration() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFile = path.join(migrationsDir, '001_init.sql');

  let conn: any;
  try {
    console.log(`Running migration ${path.basename(migrationFile)}`);
    const sql = await fs.readFile(migrationFile, 'utf8');

    // If db module provides a simple query/close API (expected by tests), use it.
    if (typeof (db as any).query === 'function') {
      await (db as any).query(sql);
      if (typeof (db as any).close === 'function') {
        await (db as any).close();
      }
      console.log('Migration applied');
      return;
    }

    // Otherwise, fall back to opening a connection and executing SQL.
    const openFn = (db as any).open || (db as any).connect || (db as any).openDb || (db as any).getConnection;
    if (!openFn) throw new Error('DB open function not found in ./db (expected open/connect/openDb/getConnection)');

    conn = await openFn();

    if (typeof conn.exec === 'function') {
      await conn.exec(sql);
    } else if (typeof conn.run === 'function') {
      await conn.run(sql);
    } else if (typeof conn.query === 'function') {
      await conn.query(sql);
    } else {
      throw new Error('DB connection object has no exec/run/query method');
    }

    console.log('Migration applied');
  } catch (err: any) {
    console.error('Migration failed', err);
    throw err;
  } finally {
    try {
      if (conn) {
        if (typeof conn.close === 'function') await conn.close();
        else if (typeof conn.end === 'function') await conn.end();
      } else if (typeof (db as any).close === 'function') {
        // If we used db.query path earlier, close already called; this is a safe no-op.
        await (db as any).close();
      }
    } catch (_) {
      // noop: don't hide the main error
    }
  }
}

// export que esperan los tests
export async function run() {
  return runMigration();
}

if (require.main === module) {
  run().catch(() => { process.exitCode = 1; });
}

export { runMigration };