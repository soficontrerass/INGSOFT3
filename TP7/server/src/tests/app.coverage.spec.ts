import request from 'supertest';
import app from '../app';

describe('GET /weatherforecast additional branches', () => {
  afterEach(() => {
    delete (global as any).fetch;
  });

  it('handles API returning { rows: [...] } wrapper', async () => {
    const fakeRows = [{ created_at: '2025-11-13T00:00:00.000Z', value: { temperatureC: 10, summary: 'Wrap' } }];
    (global as any).fetch = jest.fn().mockResolvedValue({ json: async () => ({ rows: fakeRows }) });

    const res = await request(app).get('/weatherforecast').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ temperatureC: 10, summary: 'Wrap' });
  });

  it('does not crash when value is non-json string', async () => {
    const fake = [{ created_at: '2025-11-14T00:00:00.000Z', value: 'not-a-json' }];
    (global as any).fetch = jest.fn().mockResolvedValue({ json: async () => fake });

    const res = await request(app).get('/weatherforecast').expect(200);
    // ensure endpoint responds even if parsing fails
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });

  it('handles null/undefined value entries gracefully', async () => {
    const fake = [{ created_at: '2025-11-14T00:00:00.000Z', value: null }];
    (global as any).fetch = jest.fn().mockResolvedValue({ json: async () => fake });

    const res = await request(app).get('/weatherforecast').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});