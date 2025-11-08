// ...existing code...
import app from './app';

const CLIENT_URL = process.env.CLIENT_URL || 'https://tp5-client-366o626kia-uc.a.run.app';

// Redirect root to the deployed client
app.get('/', (_req, res) => {
  res.redirect(CLIENT_URL);
});

const port = process.env.PORT ? Number(process.env.PORT) : 8080;

app.listen(port, () => {
  console.log(`Server listening on port ${port} (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`);
});