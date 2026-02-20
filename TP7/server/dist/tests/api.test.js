"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
// mockear DB antes de importar app
jest.mock('../db', () => ({ query: jest.fn() }));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const db_1 = require("../db");
describe('basic API smoke tests', () => {
    beforeEach(() => jest.resetAllMocks());
    it('health endpoint returns ok', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
    it('forecasts returns mocked rows', async () => {
        db_1.query.mockResolvedValue({ rows: [{ id: 1, created_at: '2025-01-01', value: 42 }] });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].value).toBe(42);
    });
});
// ...existing code...
