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

    // soporta distintas APIs en db.ts (open / connect / openDb / getConnection)
    const openFn = (db as any).open || (db as any).connect || (db as any).openDb || (db as any).getConnection;
    if (!openFn) throw new Error('DB open function not found in ./db (expected open/connect/openDb/getConnection)');

    conn = await openFn();
    // intenta usar exec/run/query en la conexión; ejecuta el SQL
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
    // manejar/loggear el error y re-lanzarlo para que el proceso llamante lo sepa
    console.error('Migration failed', err);
    throw err;
  } finally {
    try {
      // intentamos cerrar la conexión de varias formas
      if (conn) {
        if (typeof conn.close === 'function') await conn.close();
        else if (typeof conn.end === 'function') await conn.end();
      } else if (typeof (db as any).close === 'function') {
        await (db as any).close();
      }
    } catch (_) {
      // noop: no queremos ocultar el error principal por un fallo al cerrar
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