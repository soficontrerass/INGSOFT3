import request from 'supertest';
import app from '../app';
import { query } from '../db';

jest.mock('../db', () => ({ query: jest.fn() }));
const mockedQuery = query as unknown as jest.Mock;

describe('GET /api/forecasts when query returns array directly', () => {
  afterEach(() => mockedQuery.mockReset());

  it('returns the array response unchanged', async () => {
    const rows = [{ id: 10, created_at: '2025-01-01', value: 99 }];
    mockedQuery.mockResolvedValueOnce(rows); // array, not { rows }

    const res = await request(app).get('/api/forecasts');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ cached: false, source: 'database' });
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toMatchObject({ temperatureC: 99 });
  });
});