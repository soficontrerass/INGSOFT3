"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const weather_1 = require("../services/weather");
const router = express_1.default.Router();
router.get('/health', async (_req, res) => {
    try {
        await (0, db_1.query)('SELECT 1'); // <- intentar siempre la consulta
        res.json({ status: 'ok' });
    }
    catch (err) {
        console.error('health check error', err);
        res.status(500).json({ status: 'error', error: err.message });
    }
});
// GET /forecasts -> devuelve las últimas 100 forecasts (con caché opcional)
// ?city=Madrid&useCache=true para usar caché (1 hora)
router.get('/forecasts', async (req, res) => {
    try {
        const city = req.query.city;
        const useCache = req.query.useCache === 'true';
        // Helper: normalizar filas raw a formato consistente
        const normalizeForecastRows = (rows) => {
            return rows.map((row) => {
                const val = row?.value ?? row;
                const date = val?.date ?? row?.date ?? row?.created_at ?? new Date().toISOString();
                const temperatureC = val?.temperatureC ?? val?.temp ?? val?.temperature ?? null;
                const summary = val?.summary ?? val?.s ?? val?.desc ?? '';
                return { date, temperatureC, summary };
            });
        };
        // Si requiere caché y hay ciudad específica, buscar en caché
        if (useCache && city) {
            const cacheResult = await (0, db_1.query)('SELECT forecast_data, cached_at FROM forecast_cache WHERE city = $1 AND expires_at > now()', [city]);
            if (cacheResult?.rows && cacheResult.rows.length > 0) {
                const cached = cacheResult.rows[0];
                console.log(`[CACHE HIT] City: ${city}`);
                // cached.forecast_data es ya un array (o debería serlo), normalizarlo por si acaso
                const data = Array.isArray(cached.forecast_data) ? cached.forecast_data : [cached.forecast_data];
                return res.json({
                    data: normalizeForecastRows(data),
                    cached: true,
                    cachedAt: cached.cached_at
                });
            }
        }
        // Si no hay caché o no existe, obtener de API externa (OpenWeatherMap) o fallback a BD
        let normalized = [];
        let source = 'unknown';
        if (city) {
            try {
                // Intentar consultar API externa de clima
                console.log(`[API] Fetching weather from OpenWeatherMap for: ${city}`);
                const weatherData = await (0, weather_1.getWeatherForecast)(city);
                normalized = weatherData;
                source = 'openweather';
                console.log(`[API] Got ${normalized.length} forecasts from OpenWeatherMap`);
            }
            catch (weatherErr) {
                // Fallback: si API externa falla, usar BD
                console.warn(`[API] OpenWeatherMap failed (${weatherErr.message}), falling back to DB`);
                const result = await (0, db_1.query)('SELECT id, created_at, value FROM forecasts WHERE city = $1 ORDER BY id DESC LIMIT 5', [city]);
                const rows = result?.rows ?? result;
                normalized = normalizeForecastRows(rows);
                source = 'database';
            }
        }
        else {
            // Si no hay ciudad, devolver de BD (sin filtro)
            const result = await (0, db_1.query)('SELECT id, created_at, value FROM forecasts ORDER BY id DESC LIMIT 100');
            const rows = result?.rows ?? result;
            normalized = normalizeForecastRows(rows);
            source = 'database';
        }
        // Registrar búsqueda si hay ciudad
        if (city) {
            await (0, db_1.query)('INSERT INTO searches (city) VALUES ($1)', [city]).catch(() => { });
            // Actualizar caché: guardar array completo normalizado
            if (normalized.length > 0) {
                await (0, db_1.query)(`INSERT INTO forecast_cache (city, forecast_data, expires_at) 
           VALUES ($1, $2, now() + INTERVAL '1 hour')
           ON CONFLICT (city) DO UPDATE SET forecast_data = $2, cached_at = now(), expires_at = now() + INTERVAL '1 hour'`, [city, JSON.stringify(normalized)]).catch(() => { });
            }
        }
        res.json({ data: normalized, source });
    }
    catch (err) {
        console.error('GET /forecasts error:', err);
        res.status(500).json({ error: 'database error' });
    }
});
// GET /searches -> últimas 20 búsquedas (sin duplicativos recientes)
router.get('/searches', async (_req, res) => {
    try {
        const result = await (0, db_1.query)(`SELECT DISTINCT ON (city) city, searched_at FROM searches 
       ORDER BY city, searched_at DESC LIMIT 20`);
        const rows = result?.rows ?? result;
        res.json(rows);
    }
    catch (err) {
        console.error('GET /searches error:', err);
        res.status(500).json({ error: 'database error' });
    }
});
// GET /favorites -> listar todas los favoritos
router.get('/favorites', async (_req, res) => {
    try {
        const result = await (0, db_1.query)('SELECT id, city, created_at FROM favorites ORDER BY created_at DESC');
        const rows = result?.rows ?? result;
        res.json(rows);
    }
    catch (err) {
        console.error('GET /favorites error:', err);
        res.status(500).json({ error: 'database error' });
    }
});
// POST /favorites -> agregar ciudad a favoritos
router.post('/favorites', async (req, res) => {
    try {
        const { city } = req.body;
        if (!city || typeof city !== 'string') {
            return res.status(400).json({ error: 'city required' });
        }
        const result = await (0, db_1.query)('INSERT INTO favorites (city) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id, city, created_at', [city]);
        const rows = result?.rows ?? result;
        if (rows && rows.length > 0) {
            return res.status(201).json(rows[0]);
        }
        else {
            return res.status(409).json({ error: 'already exists' });
        }
    }
    catch (err) {
        console.error('POST /favorites error:', err);
        res.status(500).json({ error: 'database error' });
    }
});
// DELETE /favorites/:city -> eliminar favorito
router.delete('/favorites/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const result = await (0, db_1.query)('DELETE FROM favorites WHERE city = $1 RETURNING id, city', [city]);
        const rows = result?.rows ?? result;
        if (rows && rows.length > 0) {
            return res.json({ success: true, deleted: rows[0] });
        }
        else {
            return res.status(404).json({ error: 'not found' });
        }
    }
    catch (err) {
        console.error('DELETE /favorites error:', err);
        res.status(500).json({ error: 'database error' });
    }
});
exports.default = router;
// ...existing code...
