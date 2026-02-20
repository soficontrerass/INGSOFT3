"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
describe('/api routes (isolated db mocks)', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });
    it('GET /api/forecasts returns rows from db', async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock('../db', () => ({
                query: jest.fn().mockResolvedValue({ rows: [{ id: 1, created_at: '2025-11-13T00:00:00Z', value: { temperatureC: 21, summary: 'Test' } }] }),
                close: jest.fn()
            }));
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const app = require('../app').default;
            const res = await (0, supertest_1.default)(app).get('/api/forecasts').expect(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0]).toHaveProperty('value');
        });
    });
    it('GET /api/forecasts returns 500 on db error', async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock('../db', () => ({ query: jest.fn().mockRejectedValue(new Error('db')), close: jest.fn() }));
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const app = require('../app').default;
            const res = await (0, supertest_1.default)(app).get('/api/forecasts').expect(500);
            expect(res.body).toHaveProperty('error', 'database error');
        });
    });
    it('GET /api/health returns ok when db query succeeds', async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock('../db', () => ({ query: jest.fn().mockResolvedValue({ rows: [{ ok: 1 }] }), close: jest.fn() }));
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const app = require('../app').default;
            const res = await (0, supertest_1.default)(app).get('/api/health').expect(200);
            expect(res.body).toHaveProperty('status', 'ok');
        });
    });
    it('GET /api/health returns 500 when db query fails', async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock('../db', () => ({ query: jest.fn().mockRejectedValue(new Error('fail')), close: jest.fn() }));
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const app = require('../app').default;
            const res = await (0, supertest_1.default)(app).get('/api/health').expect(500);
            expect(res.body).toHaveProperty('status', 'error');
        });
    });
});
