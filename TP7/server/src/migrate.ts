// ...existing code...
import fs from 'fs';
import path from 'path';
import { query, close } from './db';

async function run() {
  try {
    const sqlPath = path.join(__dirname, '..', 'migrations', '001_init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running migration 001_init.sql');
    await query(sql);
    console.log('Migration applied');
  } catch (err: any) {
    console.error('Migration failed', err);
    process.exitCode = 1;
  } finally {
    await close();
  }
}

run();
// ...existing code...