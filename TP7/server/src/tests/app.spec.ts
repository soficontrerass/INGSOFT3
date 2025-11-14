// mock DB before importing app
jest.mock('../db', () => ({
  query: jest.fn(),
  close: jest.fn(),
}));

import request from 'supertest';
import app from '../app';
import { query } from '../db';

describe('/api routes', () => {
  beforeEach(() => {
    (query as unknown as jest.Mock).mockReset();
  });

  it('GET /api/forecasts returns rows from db', async () => {
    (query as unknown as jest.Mock).mockResolvedValue({ rows: [{ id: 1, created_at: '2025-11-13T00:00:00Z', value: { temperatureC: 21, summary: 'Test' } }] });
    const res = await request(app).get('/api/forecasts').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('value');
  });

  it('GET /api/forecasts returns 500 on db error', async () => {
    (query as unknown as jest.Mock).mockRejectedValue(new Error('db'));
    const res = await request(app).get('/api/forecasts').expect(500);
    expect(res.body).toHaveProperty('error', 'database error');
  });

  it('GET /api/health returns ok when db query succeeds', async () => {
    (query as unknown as jest.Mock).mockResolvedValue({ rows: [{ ok: 1 }] });
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/health returns 500 when db query fails', async () => {
    (query as unknown as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/health').expect(500);
    expect(res.body).toHaveProperty('status', 'error');
  });
});