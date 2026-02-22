import request from 'supertest';
import app from '../app';
import * as db from '../db';

jest.mock('../db');

describe('GET /api/favorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array when no favorites exist', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app).get('/api/favorites');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return all favorites ordered by created_at DESC', async () => {
    const mockFavorites = [
      { id: 1, city: 'Madrid', created_at: '2024-01-15T12:00:00Z' },
      { id: 2, city: 'Barcelona', created_at: '2024-01-14T11:30:00Z' }
    ];
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: mockFavorites
    });

    const res = await request(app).get('/api/favorites');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockFavorites);
    // GET /favorites has no SQL parameters
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY created_at DESC')
    );
  });

  it('should handle database errors', async () => {
    (db.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/favorites');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'database error' });
  });
});

describe('POST /api/favorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a new favorite', async () => {
    const newFavorite = { id: 1, city: 'Madrid', created_at: '2024-01-15T12:00:00Z' };
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [newFavorite]
    });

    const res = await request(app)
      .post('/api/favorites')
      .send({ city: 'Madrid' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(newFavorite);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO favorites'),
      expect.arrayContaining(['Madrid'])
    );
  });

  it('should return 400 if city is missing', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'city required' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('should return 409 if favorite already exists', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [] // no rows returned = conflict
    });

    const res = await request(app)
      .post('/api/favorites')
      .send({ city: 'Madrid' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'already exists' });
  });

  it('should handle database errors', async () => {
    (db.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/favorites')
      .send({ city: 'Madrid' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'database error' });
  });
});

describe('DELETE /api/favorites/:city', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete an existing favorite', async () => {
    const deleted = { id: 1, city: 'Madrid' };
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [deleted]
    });

    const res = await request(app).delete('/api/favorites/Madrid');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, deleted });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM favorites'),
      expect.arrayContaining(['Madrid'])
    );
  });

  it('should return 404 if favorite not found', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: []
    });

    const res = await request(app).delete('/api/favorites/NonExistent');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });

  it('should handle database errors', async () => {
    (db.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).delete('/api/favorites/Madrid');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'database error' });
  });
});
