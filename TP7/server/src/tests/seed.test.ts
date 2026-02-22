import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

const queryMock: any = jest.fn();
const closeMock: any = jest.fn();

jest.mock('../db', () => ({
  query: (...args: any[]) => queryMock(...args),
  close: (...args: any[]) => closeMock(...args)
}));

describe('seedForecastsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.exitCode = undefined;
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  it('cleans and inserts all city forecasts', async () => {
    queryMock.mockResolvedValue({ rows: [] });
    closeMock.mockResolvedValue(undefined);

    const { seedForecastsData } = await import('../seed');
    await seedForecastsData();

    expect(queryMock).toHaveBeenCalledWith('DELETE FROM forecasts');
    const insertCalls = queryMock.mock.calls.filter(
      (call: any[]) => typeof call[0] === 'string' && call[0].includes('INSERT INTO forecasts')
    );
    expect(insertCalls).toHaveLength(15);
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBeUndefined();
  });

  it('sets process exit code and closes connection when seed fails', async () => {
    queryMock.mockRejectedValueOnce(new Error('db down'));
    closeMock.mockResolvedValue(undefined);

    const { seedForecastsData } = await import('../seed');
    await expect(seedForecastsData()).rejects.toThrow('db down');

    expect(process.exitCode).toBe(1);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
