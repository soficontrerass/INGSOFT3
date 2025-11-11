// ...existing code...
import express from 'express';
import { query } from '../db';

const router = express.Router();

router.get('/health', async (_req, res) => {
  try {
    // check db connectivity if configured
    if (process.env.DB_NAME || process.env.DATABASE_URL) {
      await query('SELECT 1');
    }
    res.json({ status: 'ok' });
  } catch (err: any) {
    console.error('health check error', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /forecasts -> devuelve las últimas 100 forecasts
router.get('/forecasts', async (_req, res) => {
  try {
    const result: any = await query('SELECT id, created_at, value FROM forecasts ORDER BY id DESC LIMIT 100');
    // soporta tanto retorno { rows } como arreglo directo
    const rows = result?.rows ?? result;
    res.json(rows);
  } catch (err: any) {
    console.error('GET /forecasts error:', err);
    res.status(500).json({ error: 'database error' });
  }
});

export default router;
// ...existing code...