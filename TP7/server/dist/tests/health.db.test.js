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
describe('GET /api/health with DB configured', () => {
    afterEach(() => {
        mockedQuery.mockReset();
        delete process.env.DATABASE_URL;
        delete process.env.DB_NAME;
    });
    it('calls SELECT 1 and returns ok', async () => {
        process.env.DATABASE_URL = 'postgres://local';
        mockedQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/health');
        expect(mockedQuery).toHaveBeenCalledWith('SELECT 1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
});
