// ...existing code...
import { query } from '../db';

export async function getForecasts() {
  const result: any = await query('SELECT id, created_at, value FROM forecasts ORDER BY id DESC LIMIT 100');
  return result?.rows ?? result;
}
// ...existing code...