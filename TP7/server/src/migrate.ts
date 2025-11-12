// ...existing code...
import path from 'node:path';
import { promises as fs } from 'node:fs';

async function runMigration() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFile = path.join(migrationsDir, '001_init.sql');

  let conn: any;
  let dbMod: any;
  try {
    console.log(`Running migration ${path.basename(migrationFile)}`);
    const sql = await fs.readFile(migrationFile, 'utf8');

    // require DB at runtime so Jest's jest.doMock() is respected
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    dbMod = require('./db');

    // Preferred simple API: db.query + db.close
    if (typeof dbMod.query === 'function') {
      await dbMod.query(sql);
      if (typeof dbMod.close === 'function') await dbMod.close();
      console.log('Migration applied');
      return;
    }

    // Otherwise try open/connect variants
    const openFn = dbMod.open || dbMod.connect || dbMod.openDb || dbMod.getConnection;
    if (!openFn) {
      // as a last resort, if the module itself behaves like a connection use it
      if (
        typeof dbMod.exec === 'function' ||
        typeof dbMod.run === 'function' ||
        typeof dbMod.query === 'function'
      ) {
        conn = dbMod;
      } else {
        throw new Error('DB open function not found in ./db (expected open/connect/openDb/getConnection)');
      }
    } else {
      conn = await openFn();
    }

    // execute the SQL on the connection object
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
      } else if (dbMod && typeof dbMod.close === 'function') {
        // safe close if module exported close
        await dbMod.close();
      }
    } catch (_) {
      // noop
    }
  }
}

export async function run() {
  return runMigration();
}

// helper nombrado para facilitar tests y cobertura
export async function main() {
  try {
    await run();
  } catch (err) {
    process.exitCode = 1;
    throw err;
  }
}

// handler nombrado para reemplazar la arrow function anónima en .catch
// exportado para poder invocarlo desde tests y cubrirlo
export function handleMainError(_: any) {
  // noop — preserva comportamiento previo (no imprimir / no exit())
}

if (require.main === module) {
  // usar handler nombrado para que no quede función anónima sin cobertura
  main().catch(handleMainError);
}

export { runMigration };
// ...existing code...