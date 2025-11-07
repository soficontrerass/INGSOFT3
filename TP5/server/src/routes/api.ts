// ...existing code...
import { Router } from 'express';

const router = Router();

const Summaries = [
  'Freezing', 'Bracing', 'Chilly', 'Cool', 'Mild',
  'Warm', 'Balmy', 'Hot', 'Sweltering', 'Scorching'
];

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/weatherforecast', (_req, res) => {
  const n = Number(process.env.FORECAST_COUNT) || 5;
  const now = Date.now();

  const data = Array.from({ length: n }).map((_, i) => {
    const date = new Date(now + (i + 1) * 24 * 60 * 60 * 1000).toISOString();
    const temperatureC = Math.floor(Math.random() * 75) - 20; // -20 .. 54
    const summary = Summaries[Math.floor(Math.random() * Summaries.length)];
    return { date, temperatureC, summary };
  });

  res.json(data);
});

export default router;