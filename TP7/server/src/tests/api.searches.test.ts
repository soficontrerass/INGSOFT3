import request from 'supertest';
import app from '../app';
import * as db from '../db';

jest.mock('../db');

describe('GET /api/searches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array when no searches exist', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app).get('/api/searches');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return recent distinct searches', async () => {
    const mockSearches = [
      { city: 'Madrid', searched_at: '2024-01-15T12:00:00Z' },
      { city: 'Barcelona', searched_at: '2024-01-15T11:30:00Z' }
    ];
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: mockSearches
    });

    const res = await request(app).get('/api/searches');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSearches);
    // GET /searches doesn't have SQL parameters, so only 1 argument
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('DISTINCT ON (city)')
    );
  });

  it('should handle database errors', async () => {
    (db.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/searches');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'database error' });
  });
});

describe('POST /api/searches (via /api/forecasts)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should record a search when city query parameter is provided', async () => {
    const mockForecasts = [{ id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }];
    (db.query as jest.Mock)
      .mockResolvedValueOnce({ rows: mockForecasts }) // GET forecasts
      .mockResolvedValueOnce({ rows: [] })             // INSERT searches
      .mockResolvedValueOnce({ rows: [] });            // INSERT cache

    const res = await request(app).get('/api/forecasts?city=Madrid');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockForecasts);
    // Should have called insert into searches
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO searches'),
      expect.arrayContaining(['Madrid'])
    );
  });

  it('should not fail if search insert fails', async () => {
    const mockForecasts = [{ id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }];
    (db.query as jest.Mock)
      .mockResolvedValueOnce({ rows: mockForecasts })
      .mockRejectedValueOnce(new Error('Insert failed')) // search insert fails
      .mockResolvedValueOnce({ rows: [] });              // cache insert

    const res = await request(app).get('/api/forecasts?city=Madrid');
    expect(res.status).toBe(200); // should still succeed
    expect(res.body).toEqual(mockForecasts);
  });
});
