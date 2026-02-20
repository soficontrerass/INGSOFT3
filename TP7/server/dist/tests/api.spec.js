"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('GET /weatherforecast', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        delete global.fetch;
    });
    it('returns mapped data when API returns object values', async () => {
        const fake = [{ created_at: '2025-11-13T00:00:00.000Z', value: { temperatureC: 20, summary: 'Sunny' } }];
        global.fetch = jest.fn().mockResolvedValue({ json: async () => fake });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toMatchObject({ temperatureC: 20, summary: 'Sunny' });
    });
    it('parses stringified JSON values', async () => {
        const fake = [{ created_at: '2025-11-14T00:00:00.000Z', value: JSON.stringify({ temperatureC: 18, summary: 'Cloudy' }) }];
        global.fetch = jest.fn().mockResolvedValue({ json: async () => fake });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(200);
        expect(res.body[0]).toMatchObject({ temperatureC: 18, summary: 'Cloudy' });
    });
    it('returns 500 when fetch throws', async () => {
        global.fetch = jest.fn().mockImplementation(() => { throw new Error('boom'); });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(500);
        expect(res.body).toHaveProperty('error', 'internal');
    });
    it('returns empty array when API returns empty', async () => {
        global.fetch = jest.fn().mockResolvedValue({ json: async () => [] });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
});
