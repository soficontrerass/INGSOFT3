import request from 'supertest';
import app from '../app';
import { query } from '../db';

jest.mock('../db', () => ({ query: jest.fn() }));
const mockedQuery = query as unknown as jest.Mock;

describe('GET /api/health - DB error', () => {
  afterEach(() => {
    mockedQuery.mockReset();
    delete process.env.DATABASE_URL;
    delete process.env.DB_NAME;
  });

  it('returns 500 and error body when DB check fails', async () => {
    process.env.DATABASE_URL = 'postgres://local';
    mockedQuery.mockRejectedValueOnce(new Error('DB failure'));
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('error', 'DB failure');
  });
});