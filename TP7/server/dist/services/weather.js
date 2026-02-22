"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherForecast = getWeatherForecast;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5';
/**
 * Obtener pronóstico de clima desde OpenWeatherMap
 * Retorna array de 5 días de pronóstico
 */
async function getWeatherForecast(city) {
    if (!OPENWEATHER_API_KEY) {
        throw new Error('OPENWEATHER_API_KEY not configured');
    }
    try {
        console.log(`[WEATHER] Fetching forecast for ${city}...`);
        // Usar OpenWeatherMap 5-day forecast API
        // https://openweathermap.org/forecast5
        const url = `${OPENWEATHER_URL}/forecast?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Data viene con lista 'list' que tiene 40 itemsaaa (8 por día x 5 días)
        // Vamos a agrupar por día y tomar un pronóstico por día
        const forecastsByDay = new Map();
        for (const item of data.list || []) {
            // item.dt es timestamp Unix
            const date = new Date(item.dt * 1000);
            const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
            if (!forecastsByDay.has(dayKey)) {
                forecastsByDay.set(dayKey, []);
            }
            forecastsByDay.get(dayKey).push(item);
        }
        // Procesar cada día: tomar el pronóstico del mediodía (12:00)
        const forecasts = [];
        const sortedDays = Array.from(forecastsByDay.keys()).sort().slice(0, 5); // Primeros 5 días
        for (const day of sortedDays) {
            const dayForecasts = forecastsByDay.get(day) || [];
            // Buscar pronóstico del mediodía o usar el primero disponible
            const noonForecast = dayForecasts.find((f) => {
                const hour = new Date(f.dt * 1000).getUTCHours();
                return hour === 12;
            }) || dayForecasts[0];
            if (!noonForecast)
                continue;
            const temperature = noonForecast.main?.temp ?? null;
            const summary = noonForecast.weather?.[0]?.main ?? 'Unknown';
            const description = noonForecast.weather?.[0]?.description ?? '';
            forecasts.push({
                date: new Date(noonForecast.dt * 1000).toISOString(),
                temperatureC: Math.round(temperature),
                summary: capitalizeFirst(description || summary)
            });
        }
        console.log(`[WEATHER] Got ${forecasts.length} forecasts for ${city}`);
        return forecasts;
    }
    catch (err) {
        console.error(`[WEATHER] Error fetching weather for ${city}:`, err.message);
        throw err;
    }
}
function capitalizeFirst(str) {
    if (!str)
        return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
