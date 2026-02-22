// ...existing code...
import fs from 'fs';
import path from 'path';
import { query, close } from './db';

export async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    for (const file of migrationFiles) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log(`Running migration ${file}`);
      await query(sql);
    }

    console.log('Migrations applied');
  } catch (err: any) {
    console.error('Migration failed', err);
    process.exitCode = 1;
  } finally {
    await close();
  }
}

void runMigrations();
// ...existing code...