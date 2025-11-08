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

// ...existing code...
export default router;