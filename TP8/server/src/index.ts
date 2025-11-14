// ...existing code...
import path from 'path';
import fs from 'fs';
import express from 'express';
import app from './app';
import { randomInt } from 'crypto';

const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
const CLIENT_URL = process.env.CLIENT_URL || 'https://tp6-client-PLACEHOLDER.a.run.app';

// Serve client build if it exists (middleware) — safe-guarded for tests
if (fs.existsSync(CLIENT_DIST)) {
  if (typeof (app as any).use === 'function') {
    (app as any).use(express.static(CLIENT_DIST));
  }

  // SPA fallback for client builds (only if app.get exists)
  if (typeof (app as any).get === 'function') {
    (app as any).get('*', (req: any, res: any, next: any) => {
      if (!req.path.startsWith('/api') && !req.path.includes('.')) {
        return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
      }
      next();
    });
  }
}

// Always register root handler (tests expect app.get('/') to be called)
// Production: redirect to CLIENT_URL; Non-production: send simple message
if (typeof (app as any).get === 'function') {
  if (process.env.NODE_ENV === 'production') {
    (app as any).get('/', (_req: any, res: any) => {
      return res.redirect(CLIENT_URL);
    });
  } else {
    (app as any).get('/', (_req: any, res: any) => {
      // If client build exists prefer serving index.html, otherwise send message
      if (fs.existsSync(CLIENT_DIST)) {
        return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
      }
      return res.send('Server running. Use the client UI to interact.');
    });
  }
}

// Add /weatherforecast route only if app.get exists (keeps tests deterministic)
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

// Start server only if app.listen exists (tests mock app without listen)
if (typeof (app as any).listen === 'function') {
  const port = process.env.PORT ? Number(process.env.PORT) : 8080;
  (app as any).listen(port, () => {
    console.log(`Server listening on port ${port} (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`);
  });
}
// ...existing code...