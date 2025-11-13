"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.close = close;
// ...existing code...
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
let pool = null;
function getPool() {
    if (pool)
        return pool;
    if (connectionString) {
        pool = new pg_1.Pool({ connectionString });
    }
    else if (process.env.DB_NAME || process.env.DB_HOST) {
        pool = new pg_1.Pool({
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        });
    }
    else {
        // No DB configured: create a dummy pool that throws on query to avoid silent failures
        throw new Error('No database configuration found (set DATABASE_URL or DB_ env vars).');
    }
    return pool;
}
async function query(text, params) {
    const p = getPool();
    return p.query(text, params);
}
async function close() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
// ...existing code...