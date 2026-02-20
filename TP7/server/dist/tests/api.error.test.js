"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app")); // ajusta si tu app se exporta desde otro archivo
const db_1 = require("../db"); // módulo que tu test anterior ya mockeaba
jest.mock('../db', () => ({
    query: jest.fn()
}));
const mockedQuery = db_1.query;
describe('API /api/forecasts - errores y edge cases', () => {
    afterEach(() => {
        mockedQuery.mockReset();
    });
    it('devuelve 500 cuando la BD lanza un error', async () => {
        mockedQuery.mockRejectedValueOnce(new Error('DB unavailable'));
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
    it('devuelve 200 y array vacío cuando no hay filas', async () => {
        mockedQuery.mockResolvedValueOnce({ rows: [] });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
    it('devuelve 200 y estructura esperada cuando hay filas', async () => {
        mockedQuery.mockResolvedValueOnce({
            rows: [{ id: 1, created_at: '2025-01-01', value: 42 }]
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toMatchObject({ id: 1, value: 42 });
    });
});
