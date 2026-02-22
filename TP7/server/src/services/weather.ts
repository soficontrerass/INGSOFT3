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

  try {
    console.log(`[WEATHER] Fetching forecast for ${city}...`);

    const url = `${WEATHERAPI_URL}/forecast.json?key=${encodeURIComponent(WEATHERAPI_KEY)}&q=${encodeURIComponent(city)}&days=5&aqi=no&alerts=no`;
    
    const response = await fetch(url);
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

    console.log(`[WEATHER] Got ${forecasts.length} forecasts for ${city}`);
    return forecasts;
  } catch (err: any) {
    console.error(`[WEATHER] Error fetching weather for ${city}:`, err.message);
    throw err;
  }
}

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
