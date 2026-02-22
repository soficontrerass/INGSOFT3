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
describe('GET /api/favorites', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return empty array when no favorites exist', async () => {
        db.query.mockResolvedValueOnce({
            rows: []
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/favorites');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
    it('should return all favorites ordered by created_at DESC', async () => {
        const mockFavorites = [
            { id: 1, city: 'Madrid', created_at: '2024-01-15T12:00:00Z' },
            { id: 2, city: 'Barcelona', created_at: '2024-01-14T11:30:00Z' }
        ];
        db.query.mockResolvedValueOnce({
            rows: mockFavorites
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/favorites');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockFavorites);
        // GET /favorites has no SQL parameters
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY created_at DESC'));
    });
    it('should handle database errors', async () => {
        db.query.mockRejectedValueOnce(new Error('DB error'));
        const res = await (0, supertest_1.default)(app_1.default).get('/api/favorites');
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
        db.query.mockResolvedValueOnce({
            rows: [newFavorite]
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/favorites')
            .send({ city: 'Madrid' });
        expect(res.status).toBe(201);
        expect(res.body).toEqual(newFavorite);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO favorites'), expect.arrayContaining(['Madrid']));
    });
    it('should return 400 if city is missing', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/favorites')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'city required' });
        expect(db.query).not.toHaveBeenCalled();
    });
    it('should return 409 if favorite already exists', async () => {
        db.query.mockResolvedValueOnce({
            rows: [] // no rows returned = conflict
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/favorites')
            .send({ city: 'Madrid' });
        expect(res.status).toBe(409);
        expect(res.body).toEqual({ error: 'already exists' });
    });
    it('should handle database errors', async () => {
        db.query.mockRejectedValueOnce(new Error('DB error'));
        const res = await (0, supertest_1.default)(app_1.default)
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
        db.query.mockResolvedValueOnce({
            rows: [deleted]
        });
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/favorites/Madrid');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, deleted });
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM favorites'), expect.arrayContaining(['Madrid']));
    });
    it('should return 404 if favorite not found', async () => {
        db.query.mockResolvedValueOnce({
            rows: []
        });
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/favorites/NonExistent');
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'not found' });
    });
    it('should handle database errors', async () => {
        db.query.mockRejectedValueOnce(new Error('DB error'));
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/favorites/Madrid');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'database error' });
    });
});
