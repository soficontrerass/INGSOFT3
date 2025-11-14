// ...existing code...
import request from 'supertest';

describe('/api routes (isolated db mocks)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('GET /api/forecasts returns rows from db', async () => {
    jest.doMock('../db', () => ({ query: jest.fn().mockResolvedValue({ rows: [{ id: 1, created_at: '2025-11-13T00:00:00Z', value: { temperatureC: 21, summary: 'Test' } }] }), close: jest.fn() }));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require('../app').default;
    const res = await request(app).get('/api/forecasts').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('value');
  });

  it('GET /api/forecasts returns 500 on db error', async () => {
    jest.doMock('../db', () => ({ query: jest.fn().mockRejectedValue(new Error('db')), close: jest.fn() }));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require('../app').default;
    const res = await request(app).get('/api/forecasts').expect(500);
    expect(res.body).toHaveProperty('error', 'database error');
  });

  it('GET /api/health returns ok when db query succeeds', async () => {
    jest.doMock('../db', () => ({ query: jest.fn().mockResolvedValue({ rows: [{ ok: 1 }] }), close: jest.fn() }));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require('../app').default;
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/health returns 500 when db query fails', async () => {
    jest.doMock('../db', () => ({ query: jest.fn().mockRejectedValue(new Error('fail')), close: jest.fn() }));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require('../app').default;
    const res = await request(app).get('/api/health').expect(500);
    expect(res.body).toHaveProperty('status', 'error');
  });
});
// ...existing code...