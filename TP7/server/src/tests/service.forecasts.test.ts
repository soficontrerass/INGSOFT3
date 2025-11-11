import { getForecasts } from '../services/forecasts'; // ajusta según tu proyecto
import { query } from '../db';

jest.mock('../db', () => ({
  query: jest.fn()
}));

const mockedQuery = query as unknown as jest.Mock;

describe('Service: getForecasts', () => {
  afterEach(() => mockedQuery.mockReset());

  it('devuelve lista de forecasts cuando la BD responde', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 1, created_at: '2025-01-01', value: 42 }]
    });

    const result = await getForecasts();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({ id: 1, value: 42 });
  });

  it('lanza error cuando la BD falla', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('db fail'));
    await expect(getForecasts()).rejects.toThrow('db fail');
  });
});