const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY || '';
const WEATHERAPI_URL = 'https://api.weatherapi.com/v1';

export interface WeatherForecast {
  date: string;
  temperatureC: number;
  summary: string;
}

/**
 * Obtener pronóstico de clima desde WeatherAPI
 * Retorna array de hasta 5 días de pronóstico
 */
export async function getWeatherForecast(city: string): Promise<WeatherForecast[]> {
  if (!WEATHERAPI_KEY) {
    throw new Error('WEATHERAPI_KEY not configured');
  }

  const normalizedCity = city?.trim();
  if (!normalizedCity) {
    throw new Error('city is required');
  }
  if (!/^[\p{L}\s._-]{1,80}$/u.test(normalizedCity)) {
    throw new Error('invalid city format');
  }

  try {
    console.log(`[WEATHER] Fetching forecast for ${normalizedCity}...`);

    const url = new URL(`${WEATHERAPI_URL}/forecast.json`);
    url.searchParams.set('key', WEATHERAPI_KEY);
    url.searchParams.set('q', normalizedCity);
    url.searchParams.set('days', '5');
    url.searchParams.set('aqi', 'no');
    url.searchParams.set('alerts', 'no');
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const days = data?.forecast?.forecastday ?? [];
    const forecasts: WeatherForecast[] = days.map((day: any) => ({
      date: day?.date ? new Date(`${day.date}T12:00:00Z`).toISOString() : new Date().toISOString(),
      temperatureC: Math.round(day?.day?.avgtemp_c ?? 0),
      summary: capitalizeFirst(day?.day?.condition?.text ?? 'Unknown')
    }));

    console.log(`[WEATHER] Got ${forecasts.length} forecasts for ${normalizedCity}`);
    return forecasts;
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[WEATHER] Error fetching weather for ${normalizedCity}:`, message);
    throw err instanceof Error ? err : new Error(message);
  }
}

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
