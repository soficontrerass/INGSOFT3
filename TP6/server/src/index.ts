// ...existing code...
import app from './app';

const CLIENT_URL = process.env.CLIENT_URL || 'https://tp6-client-PLACEHOLDER.a.run.app';

// Redirect root to the deployed client only in production
if (process.env.NODE_ENV === 'production') {
  app.get('/', (_req, res) => res.redirect(CLIENT_URL));
} else {
  app.get('/', (_req, res) => res.send('Server running. Use the client UI to interact.'));
}

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port} (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`);
});