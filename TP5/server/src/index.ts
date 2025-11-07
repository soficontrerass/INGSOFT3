// ...existing code...
import app from './app';

const port = process.env.PORT ? Number(process.env.PORT) : 8080;

app.listen(port, () => {
  console.log(`Server listening on port ${port} (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`);
});