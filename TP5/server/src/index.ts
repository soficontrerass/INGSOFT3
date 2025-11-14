// ...existing code...
import { randomInt } from 'crypto';
import app from './app';

const CLIENT_URL = process.env.CLIENT_URL || 'https://tp5-client-366o626kia-uc.a.run.app';

// Redirect root to the deployed client only in production
if (process.env.NODE_ENV === 'production') {
  app.get('/', (_req, res) => res.redirect(CLIENT_URL));
} else {
  app.get('/', (_req, res) => res.send('Server running. Use the client UI to interact.'));
}

if (typeof (app as any).get === 'function') {
  (app as any).get('/weatherforecast', (_req: any, res: any) => {
    const count = Number(process.env.FORECAST_COUNT || 5);
    const summaries = ['Freezing','Bracing','Chilly','Cool','Mild','Warm','Balmy','Hot','Sweltering','Scorching'];
    const data = Array.from({ length: count }).map((_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString(),
      // reemplazo seguro:
      temperatureC: randomInt(35) - 5, // 0..34 -> -5..29
      summary: summaries[randomInt(summaries.length)]
    }));
    res.json(data);
  });
}

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port} (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`);
});