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
describe('GET /api/health - DB error', () => {
    afterEach(() => {
        mockedQuery.mockReset();
        delete process.env.DATABASE_URL;
        delete process.env.DB_NAME;
    });
    it('returns 500 and error body when DB check fails', async () => {
        process.env.DATABASE_URL = 'postgres://local';
        mockedQuery.mockRejectedValueOnce(new Error('DB failure'));
        const res = await (0, supertest_1.default)(app_1.default).get('/api/health');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('status', 'error');
        expect(res.body).toHaveProperty('error', 'DB failure');
    });
});
