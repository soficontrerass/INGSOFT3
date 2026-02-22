import request from 'supertest';
import app from '../app'; // ajusta si tu app se exporta desde otro archivo
import { query } from '../db'; // módulo que tu test anterior ya mockeaba

jest.mock('../db', () => ({
  query: jest.fn()
}));

const mockedQuery = query as unknown as jest.Mock;

describe('API /api/forecasts - errores y edge cases', () => {
  afterEach(() => {
    mockedQuery.mockReset();
  });

  it('devuelve 500 cuando la BD lanza un error', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('DB unavailable'));
    const res = await request(app).get('/api/forecasts');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('devuelve 200 y array vacío cuando no hay filas', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/forecasts');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ cached: false, source: 'database' });
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('devuelve 200 y estructura esperada cuando hay filas', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 1, created_at: '2025-01-01', value: 42 }]
    });
    const res = await request(app).get('/api/forecasts');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ cached: false, source: 'database' });
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toMatchObject({ temperatureC: 42 });
  });
});