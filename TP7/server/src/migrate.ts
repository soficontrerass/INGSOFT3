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

    // soporta distintas APIs en db.ts (open / connect / openDb)
    const openFn = (db as any).open || (db as any).connect || (db as any).openDb;
    if (!openFn) throw new Error('DB open function not found in ./db (expected open/connect/openDb)');

    conn = await openFn();
    // intenta usar exec en la conexión; si la API es distinta, ajustá según tu db.ts
    if (typeof conn.exec !== 'function' && typeof conn.run === 'function') {
      await conn.run(sql);
    } else if (typeof conn.exec === 'function') {
      await conn.exec(sql);
    } else {
      throw new Error('DB connection object has no exec/run method');
    }

    console.log('Migration applied');
  } catch (err: any) {
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
    } catch (e) {
      // noop: no queremos ocultar el error principal por un fallo al cerrar
    }
  }
}

if (require.main === module) {
  runMigration().catch(() => { process.exitCode = 1; });
}

export { runMigration };