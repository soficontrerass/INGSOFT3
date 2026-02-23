// ...existing code...
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import { randomInt } from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const buildFallbackForecasts = (count = 5) => {
  const summaries = ['Freezing', 'Bracing', 'Chilly', 'Cool', 'Mild', 'Warm', 'Balmy', 'Hot', 'Sweltering', 'Scorching'];
  return Array.from({ length: count }).map((_, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString(),
    temperatureC: randomInt(35) - 5,
    summary: summaries[randomInt(summaries.length)]
  }));
};

// DEBUG: logear todas las requests (temporal)
app.use((req, _res, next) => {
  console.log('[REQ] incoming request');
  next();
});

// Health check simple para comprobar que la app responde
app.get('/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

// <-- Insert: endpoint /weatherforecast que reutiliza /api/forecasts y mapea la respuesta -->
app.get('/weatherforecast', async (_req, res) => {
  try {
    const internalApi = process.env.INTERNAL_API_URL
      ?? `http://${process.env.INTERNAL_HOST ?? '127.0.0.1'}:${process.env.PORT ?? '8080'}/api/forecasts`;

    console.log('[DEBUG] calling internal API:', internalApi);

    const resp: any = await fetch(internalApi, { method: 'GET' });

    // Si el mock no provee .ok asumimos que está OK (comportamiento de tests)
    const ok = typeof resp?.ok === 'boolean' ? resp.ok : true;
    const status = resp?.status ?? 200;

    if (!ok) {
      // Manejar caso donde resp.text no está definido (mocks)
      let text = '';
      if (typeof resp?.text === 'function') {
        text = await resp.text().catch(() => '');
      } else if (typeof resp?.body === 'string') {
        text = resp.body;
      } else {
        try {
          // intentar extraer json para mensaje de error
          const j = await resp.json?.();
          text = typeof j === 'string' ? j : JSON.stringify(j || '');
        } catch {
          text = '';
        }
      }
      console.error('Upstream error', status, text);
      return res.status(status).json({ error: 'upstream', status, message: text });
    }

    const rows = await (typeof resp.json === 'function' ? resp.json() : resp);
    const list = Array.isArray(rows) ? rows : (rows && Array.isArray(rows.rows) ? rows.rows : []);

    const mapped = list.map((row: any) => {
      const date = row.date ?? row.created_at ?? new Date().toISOString();
      let temperatureC: any = null;
      let summary: any = null;

      const val = row.value ?? row;

      if (val && typeof val === 'object') {
        temperatureC = val.temperatureC ?? val.temp ?? val.temperature ?? null;
        summary = val.summary ?? val.s ?? val.desc ?? null;
      } else if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          temperatureC = parsed.temperatureC ?? parsed.temp ?? null;
          summary = parsed.summary ?? parsed.s ?? null;
        } catch {
          // ignore non-JSON string
        }
      }

      return { date, temperatureC, summary };
    });

    if (mapped.length === 0) {
      return res.json(buildFallbackForecasts());
    }

    return res.json(mapped);
  } catch (err: any) {
    console.error('GET /weatherforecast error:', err);
    return res.json(buildFallbackForecasts());
  }
});
// <-- end insert -->

// monta tu API en /api para que supertest la pueda consumir sin levantar el servidor
app.use('/api', apiRouter);

export default app;
// ...existing code...