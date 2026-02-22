import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';

const ORIGINAL_ENV = process.env;

describe('weather service', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV, WEATHERAPI_KEY: 'test-key' };
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  it('maps WeatherAPI response into app forecast format', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        forecast: {
          forecastday: [
            { date: '2026-02-20', day: { avgtemp_c: 20.4, condition: { text: 'sunny' } } },
            { date: '2026-02-21', day: { avgtemp_c: 18.6, condition: { text: 'cloudy' } } }
          ]
        }
      })
    });

    const { getWeatherForecast } = await import('../services/weather');
    const result = await getWeatherForecast('Madrid');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (global.fetch as any).mock.calls[0][0] as string;
    expect(calledUrl).toContain('forecast.json');
    expect(calledUrl).toContain('q=Madrid');
    expect(result).toEqual([
      expect.objectContaining({ temperatureC: 20, summary: 'Sunny' }),
      expect.objectContaining({ temperatureC: 19, summary: 'Cloudy' })
    ]);
  });

  it('returns defaults when payload fields are missing', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ forecast: { forecastday: [{ day: {} }] } })
    });

    const { getWeatherForecast } = await import('../services/weather');
    const result = await getWeatherForecast('Bogota');

    expect(result[0]).toMatchObject({ temperatureC: 0, summary: 'Unknown' });
    expect(typeof result[0].date).toBe('string');
  });

  it('throws when WeatherAPI responds with error status', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    });

    const { getWeatherForecast } = await import('../services/weather');
    await expect(getWeatherForecast('Madrid')).rejects.toThrow('WeatherAPI error: 401 Unauthorized');
  });

  it('throws when city is invalid', async () => {
    const { getWeatherForecast } = await import('../services/weather');
    await expect(getWeatherForecast('')).rejects.toThrow('city is required');
    await expect(getWeatherForecast('@@@')).rejects.toThrow('invalid city format');
  });

  it('throws when API key is missing', async () => {
    process.env = { ...ORIGINAL_ENV, WEATHERAPI_KEY: '' };
    jest.resetModules();
    const { getWeatherForecast } = await import('../services/weather');
    await expect(getWeatherForecast('Madrid')).rejects.toThrow('WEATHERAPI_KEY not configured');
  });
});
