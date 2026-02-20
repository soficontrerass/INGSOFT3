// ...existing code...
import express from 'express';
import apiRouter from './routes/api';

const app = express();
app.use(express.json());

// DEBUG: logear todas las requests (temporal)
app.use((req, _res, next) => {
  console.log('[REQ]', req.method, req.path, 'cwd=', process.cwd());
  next();
});

// Health check simple para comprobar que la app responde
app.get('/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

// <-- Insert: endpoint /weatherforecast que reutiliza /api/forecasts y mapea la respuesta -->
app.get('/weatherforecast', async (_req, res) => {
  try {
    // Preferir URL completa si la definiste (ej: INTERNAL_API_URL=http://servicio:8080)
    const internalApi = process.env.INTERNAL_API_URL
      ?? `http://${process.env.INTERNAL_HOST ?? '127.0.0.1'}:${process.env.PORT ?? '8080'}/api/forecasts`;

    console.log('[DEBUG] calling internal API:', internalApi);

    const resp = await fetch(internalApi, { method: 'GET' });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      console.error('Upstream error', resp.status, text);
      return res.status(resp.status).json({ error: 'upstream', status: resp.status, message: text });
    }

    const rows = await resp.json();

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
          // no JSON en value => ignorar
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
// <-- end insert -->

// monta tu API en /api para que supertest la pueda consumir sin levantar el servidor
app.use('/api', apiRouter);

export default app;
// ...existing code...