"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const db = __importStar(require("../db"));
jest.mock('../db');
describe('GET /api/forecasts with caching', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return forecasts without city parameter', async () => {
        const mockForecasts = [
            { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }
        ];
        db.query.mockResolvedValueOnce({
            rows: mockForecasts
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockForecasts);
        // GET /forecasts without params has no SQL parameters
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, created_at, value FROM forecasts'));
    });
    it('should hit cache if useCache=true and city is provided with valid cache entry', async () => {
        const cachedForecast = {
            forecast_data: { temp: 20, condition: 'sunny' },
            cached_at: '2024-01-15T12:00:00Z'
        };
        db.query.mockResolvedValueOnce({
            rows: [cachedForecast] // cache HIT
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts?city=Madrid&useCache=true');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            data: cachedForecast.forecast_data,
            cached: true,
            cachedAt: cachedForecast.cached_at
        });
        // Should only call cache check, not insert searches/cache
        expect(db.query).toHaveBeenCalledTimes(1);
    });
    it('should miss cache and fetch from DB if no valid cache entry', async () => {
        const mockForecasts = [
            { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }
        ];
        db.query
            .mockResolvedValueOnce({ rows: [] }) // cache MISS
            .mockResolvedValueOnce({ rows: mockForecasts }) // get forecasts
            .mockResolvedValueOnce({ rows: [] }) // insert searches
            .mockResolvedValueOnce({ rows: [] }); // insert cache
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts?city=Madrid&useCache=true');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockForecasts);
        // Should have tried cache, then forecast, then search, then cache insert
        expect(db.query).toHaveBeenCalledTimes(4);
    });
    it('should not check cache without city parameter even with useCache=true', async () => {
        const mockForecasts = [
            { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }
        ];
        db.query.mockResolvedValueOnce({
            rows: mockForecasts
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts?useCache=true');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockForecasts);
        // Should skip cache check if no city
        expect(res.body[0].value).toBeDefined(); // raw forecast, not cached format
    });
    it('should handle database errors gracefully', async () => {
        db.query.mockRejectedValueOnce(new Error('DB error'));
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'database error' });
    });
    it('should still return forecasts even if cache insert fails', async () => {
        const mockForecasts = [
            { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }
        ];
        db.query
            .mockResolvedValueOnce({ rows: [] }) // cache MISS
            .mockResolvedValueOnce({ rows: mockForecasts }) // get forecasts
            .mockResolvedValueOnce({ rows: [] }) // insert searches
            .mockRejectedValueOnce(new Error('Cache insert failed')); // cache insert fails
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts?city=Madrid&useCache=true');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockForecasts); // still returns forecast despite cache fail
    });
    it('should update cache expiry on cache insert (conflict resolution)', async () => {
        const mockForecasts = [
            { id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 21 } }
        ];
        db.query
            .mockResolvedValueOnce({ rows: [] }) // cache MISS
            .mockResolvedValueOnce({ rows: mockForecasts }) // get forecasts
            .mockResolvedValueOnce({ rows: [] }) // insert searches
            .mockResolvedValueOnce({ rows: [] }); // insert cache with ON CONFLICT
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts?city=Barcelona&useCache=true');
        expect(res.status).toBe(200);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT (city) DO UPDATE'), expect.anything());
    });
});
