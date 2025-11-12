// ...existing code...
import fs from 'node:fs';
import path from 'node:path';
import { query, close } from './db';

async function run() {
  try {
  const sqlPath = path.join(__dirname, '..', 'migrations', '001_init.sql');
  const sql = await fs.promises.readFile(sqlPath, 'utf8');
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

run().catch((err) => {
  console.error('Unexpected migration error', err);
  process.exitCode = 1;
});
// ...existing code...