// ...existing code...
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/weatherforecast', async (_req, res) => {
  try {
    // llamar a la ruta interna /api/forecasts y mapear a la forma esperada por el cliente
    const internalHost = process.env.INTERNAL_HOST ?? '127.0.0.1';
    const internalPort = process.env.PORT ?? '8080';
    const resp = await fetch(`http://${internalHost}:${internalPort}/api/forecasts`);
    const rows = await resp.json();

    const mapped = (Array.isArray(rows) ? rows : (rows.rows || []))
      .map((row: any) => {
        const date = row.date ?? row.created_at ?? new Date().toISOString();
        let temperatureC: any = null;
        let summary: any = null;

        const val = row.value;
        if (val && typeof val === 'object') {
          temperatureC = val.temperatureC ?? val.temp ?? null;
          summary = val.summary ?? val.s ?? null;
        } else if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            temperatureC = parsed.temperatureC ?? parsed.temp ?? null;
            summary = parsed.summary ?? parsed.s ?? null;
          } catch {
            // no JSON in value, ignore
          }
        }

        return { date, temperatureC, summary };
      });

    return res.json(mapped);
  } catch (err: any) {
    console.error('GET /weatherforecast error:', err);
    return res.status(500).json({ error: 'internal' });
  }
});

app.use('/', apiRouter);

export default app;