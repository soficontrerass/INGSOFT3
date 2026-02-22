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
describe('GET /api/searches', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return empty array when no searches exist', async () => {
        db.query.mockResolvedValueOnce({
            rows: []
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/searches');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
    it('should return recent distinct searches', async () => {
        const mockSearches = [
            { city: 'Madrid', searched_at: '2024-01-15T12:00:00Z' },
            { city: 'Barcelona', searched_at: '2024-01-15T11:30:00Z' }
        ];
        db.query.mockResolvedValueOnce({
            rows: mockSearches
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/searches');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockSearches);
        // GET /searches doesn't have SQL parameters, so only 1 argument
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('DISTINCT ON (city)'));
    });
    it('should handle database errors', async () => {
        db.query.mockRejectedValueOnce(new Error('DB error'));
        const res = await (0, supertest_1.default)(app_1.default).get('/api/searches');
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
        db.query
            .mockResolvedValueOnce({ rows: mockForecasts }) // GET forecasts
            .mockResolvedValueOnce({ rows: [] }) // INSERT searches
            .mockResolvedValueOnce({ rows: [] }); // INSERT cache
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts?city=Madrid');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockForecasts);
        // Should have called insert into searches
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO searches'), expect.arrayContaining(['Madrid']));
    });
    it('should not fail if search insert fails', async () => {
        const mockForecasts = [{ id: 1, created_at: '2024-01-15T12:00:00Z', value: { temp: 20 } }];
        db.query
            .mockResolvedValueOnce({ rows: mockForecasts })
            .mockRejectedValueOnce(new Error('Insert failed')) // search insert fails
            .mockResolvedValueOnce({ rows: [] }); // cache insert
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts?city=Madrid');
        expect(res.status).toBe(200); // should still succeed
        expect(res.body).toEqual(mockForecasts);
    });
});
