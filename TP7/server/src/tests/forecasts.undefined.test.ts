// ...existing code...
import request from 'supertest';
import app from '../app';
import { query } from '../db';

jest.mock('../db', () => ({ query: jest.fn() }));
const mockedQuery = query as unknown as jest.Mock;

describe('Handle undefined DB result for forecasts', () => {
  afterEach(() => mockedQuery.mockReset());

  it('service: getForecasts returns undefined when query yields undefined', async () => {
    const { getForecasts } = require('../services/forecasts');
    mockedQuery.mockResolvedValueOnce(undefined);
    const res = await getForecasts();
    expect(res).toBeUndefined();
  });

  it('route: GET /api/forecasts returns 200 with empty data when query yields undefined', async () => {
    mockedQuery.mockResolvedValueOnce(undefined);
    const rsp = await request(app).get('/api/forecasts');
    expect(rsp.status).toBe(200);
    expect(rsp.body).toEqual({ data: [], cached: false, source: 'database' });
  });
});
// ...existing code...