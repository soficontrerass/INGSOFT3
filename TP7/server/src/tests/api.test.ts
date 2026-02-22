// ...existing code...
// mockear DB antes de importar app
jest.mock('../db', () => ({ query: jest.fn() }));

import request from 'supertest';
import app from '../app';
import { query } from '../db';

describe('basic API smoke tests', () => {
  beforeEach(() => jest.resetAllMocks());

  it('health endpoint returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('forecasts returns mocked rows', async () => {
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 1, created_at: '2025-01-01', value: 42 }] });
    const res = await request(app).get('/api/forecasts');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ cached: false, source: 'database' });
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toMatchObject({ temperatureC: 42 });
  });
});
// ...existing code...