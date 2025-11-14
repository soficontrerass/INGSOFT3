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

// <-- Insert: endpoint /weatherforecast que reutiliza /api/forecasts y mapea la respuesta -->
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
// <-- end insert -->

// monta tu API en /api para que supertest la pueda consumir sin levantar el servidor
app.use('/api', apiRouter);

export default app;
// ...existing code...