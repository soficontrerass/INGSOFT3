"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const db_1 = require("../db");
jest.mock('../db', () => ({ query: jest.fn() }));
const mockedQuery = db_1.query;
describe('GET /api/forecasts when query returns array directly', () => {
    afterEach(() => mockedQuery.mockReset());
    it('returns the array response unchanged', async () => {
        const rows = [{ id: 10, created_at: '2025-01-01', value: 99 }];
        mockedQuery.mockResolvedValueOnce(rows); // array, not { rows }
        const res = await (0, supertest_1.default)(app_1.default).get('/api/forecasts');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toMatchObject({ id: 10, value: 99 });
    });
});
