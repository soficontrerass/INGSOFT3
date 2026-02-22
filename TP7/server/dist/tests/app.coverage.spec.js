"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('GET /weatherforecast additional branches', () => {
    afterEach(() => {
        delete global.fetch;
    });
    it('handles API returning { rows: [...] } wrapper', async () => {
        const fakeRows = [{ created_at: '2025-11-13T00:00:00.000Z', value: { temperatureC: 10, summary: 'Wrap' } }];
        global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ rows: fakeRows }) });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toMatchObject({ temperatureC: 10, summary: 'Wrap' });
    });
    it('does not crash when value is non-json string', async () => {
        const fake = [{ created_at: '2025-11-14T00:00:00.000Z', value: 'not-a-json' }];
        global.fetch = jest.fn().mockResolvedValue({ json: async () => fake });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(200);
        // ensure endpoint responds even if parsing fails
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(0);
    });
    it('handles null/undefined value entries gracefully', async () => {
        const fake = [{ created_at: '2025-11-14T00:00:00.000Z', value: null }];
        global.fetch = jest.fn().mockResolvedValue({ json: async () => fake });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
    it('returns upstream error payload when fetch response is not ok and has text()', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 502,
            text: async () => 'bad gateway',
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(502);
        expect(res.body).toMatchObject({ error: 'upstream', status: 502, message: 'bad gateway' });
    });
    it('falls back to response body string when not ok and text() is missing', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 503,
            body: 'service unavailable',
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(503);
        expect(res.body).toMatchObject({ error: 'upstream', status: 503, message: 'service unavailable' });
    });
    it('uses json fallback when not ok and there is no text/body', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ detail: 'upstream-json-error' }),
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/weatherforecast').expect(500);
        expect(res.body.error).toBe('upstream');
        expect(res.body.status).toBe(500);
        expect(String(res.body.message)).toContain('upstream-json-error');
    });
});
