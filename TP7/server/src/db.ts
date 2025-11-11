// ...existing code...
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;
  if (connectionString) {
    pool = new Pool({ connectionString });
  } else if (process.env.DB_NAME || process.env.DB_HOST) {
    pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    });
  } else {
    // No DB configured: create a dummy pool that throws on query to avoid silent failures
    throw new Error('No database configuration found (set DATABASE_URL or DB_ env vars).');
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const p = getPool();
  return p.query(text, params);
}

export async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
// ...existing code...