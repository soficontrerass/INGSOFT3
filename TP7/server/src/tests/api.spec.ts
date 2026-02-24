import request from 'supertest';
import app from '../app';

describe('GET /weatherforecast', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    delete (global as any).fetch;
  });

  it('returns mapped data when API returns object values', async () => {
    const fake = [{ created_at: '2025-11-13T00:00:00.000Z', value: { temperatureC: 20, summary: 'Sunny' } }];
    (global as any).fetch = jest.fn().mockResolvedValue({ json: async () => fake });

    const res = await request(app).get('/weatherforecast').expect(200);
    expect(Array.isArray(res.body)).toBe(false); //romper aca con false para demo 
    expect(res.body[0]).toMatchObject({ temperatureC: 20, summary: 'Sunny' });
  });

  it('parses stringified JSON values', async () => {
    const fake = [{ created_at: '2025-11-14T00:00:00.000Z', value: JSON.stringify({ temperatureC: 18, summary: 'Cloudy' }) }];
    (global as any).fetch = jest.fn().mockResolvedValue({ json: async () => fake });

    const res = await request(app).get('/weatherforecast').expect(200);
    expect(res.body[0]).toMatchObject({ temperatureC: 18, summary: 'Cloudy' });
  });

  it('returns fallback forecast when fetch throws', async () => {
    // After fallback strategy: /weatherforecast always returns 200 with fallback data
    (global as any).fetch = jest.fn().mockImplementation(() => { throw new Error('boom'); });
    const res = await request(app).get('/weatherforecast').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(5); // fallback provides 5 synthetic forecasts
    expect(res.body[0]).toHaveProperty('temperatureC');
    expect(res.body[0]).toHaveProperty('summary');
  });

  it('returns fallback forecast when API returns empty', async () => {
    // After fallback strategy: /weatherforecast always returns 200 with fallback data
    (global as any).fetch = jest.fn().mockResolvedValue({ json: async () => [] });
    const res = await request(app).get('/weatherforecast').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(5); // fallback provides 5 synthetic forecasts
    expect(res.body[0]).toHaveProperty('temperatureC');
    expect(res.body[0]).toHaveProperty('summary');
  });
});