import request from 'supertest';
import app from '../app';
import * as db from '../db';

jest.mock('../db');

describe('GET /api/forecasts with caching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const normalized = [{ date: '2024-01-15T12:00:00Z', temperatureC: 20, summary: '' }];

  it('should return forecasts without city parameter', async () => {
    const mockForecasts = [
      { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }
    ];
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: mockForecasts
    });

    const res = await request(app).get('/api/forecasts');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: normalized, cached: false, source: 'database' });
    // GET /forecasts without params has no SQL parameters
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, created_at, value FROM forecasts')
    );
  });

  it('should hit cache if useCache=true and city is provided with valid cache entry', async () => {
    const cachedForecast = {
      forecast_data: [{ date: '2024-01-15T12:00:00Z', temperatureC: 20, summary: 'sunny' }],
      cached_at: '2024-01-15T12:00:00Z'
    };
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [cachedForecast] // cache HIT
    });

    const res = await request(app).get('/api/forecasts?city=Madrid&useCache=true');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: cachedForecast.forecast_data,
      cached: true,
      source: 'cache',
      cachedAt: cachedForecast.cached_at
    });
    // Should only call cache check, not insert searches/cache
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('should miss cache and fetch from DB if no valid cache entry', async () => {
    const mockForecasts = [
      { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }
    ];
    (db.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })              // cache MISS
      .mockResolvedValueOnce({ rows: mockForecasts })   // get forecasts
      .mockResolvedValueOnce({ rows: [] })              // insert searches
      .mockResolvedValueOnce({ rows: [] });             // insert cache

    const res = await request(app).get('/api/forecasts?city=Madrid&useCache=true');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: normalized, cached: false, source: 'database' });
    // Should have tried cache, then forecast, then search, then cache insert
    expect(db.query).toHaveBeenCalledTimes(4);
  });

  it('should not check cache without city parameter even with useCache=true', async () => {
    const mockForecasts = [
      { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }
    ];
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: mockForecasts
    });

    const res = await request(app).get('/api/forecasts?useCache=true');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: normalized, cached: false, source: 'database' });
    // Should skip cache check if no city
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('should handle database errors gracefully', async () => {
    (db.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/forecasts');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'database error' });
  });

  it('should still return forecasts even if cache insert fails', async () => {
    const mockForecasts = [
      { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }
    ];
    (db.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })              // cache MISS
      .mockResolvedValueOnce({ rows: mockForecasts })   // get forecasts
      .mockResolvedValueOnce({ rows: [] })              // insert searches
      .mockRejectedValueOnce(new Error('Cache insert failed')); // cache insert fails

    const res = await request(app).get('/api/forecasts?city=Madrid&useCache=true');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: normalized, cached: false, source: 'database' }); // still returns forecast despite cache fail
  });

  it('should update cache expiry on cache insert (conflict resolution)', async () => {
    const mockForecasts = [
      { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 21 } }
    ];
    (db.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })              // cache MISS
      .mockResolvedValueOnce({ rows: mockForecasts })   // get forecasts
      .mockResolvedValueOnce({ rows: [] })              // insert searches
      .mockResolvedValueOnce({ rows: [] });             // insert cache with ON CONFLICT

    const res = await request(app).get('/api/forecasts?city=Barcelona&useCache=true');

    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT (city) DO UPDATE'),
      expect.anything()
    );
  });
});
