import request from 'supertest';
import app from '../app';
import { query } from '../db';

jest.mock('../db', () => ({ query: jest.fn() }));
const mockedQuery = query as unknown as jest.Mock;

describe('GET /api/health with DB configured', () => {
  afterEach(() => {
    mockedQuery.mockReset();
    delete process.env.DATABASE_URL;
    delete process.env.DB_NAME;
  });

  it('calls SELECT 1 and returns ok', async () => {
    process.env.DATABASE_URL = 'postgres://local';
    mockedQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const res = await request(app).get('/api/health');
    expect(mockedQuery).toHaveBeenCalledWith('SELECT 1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});