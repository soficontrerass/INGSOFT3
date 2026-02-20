"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forecasts_1 = require("../services/forecasts"); // ajusta según tu proyecto
const db_1 = require("../db");
jest.mock('../db', () => ({
    query: jest.fn()
}));
const mockedQuery = db_1.query;
describe('Service: getForecasts', () => {
    afterEach(() => mockedQuery.mockReset());
    it('devuelve lista de forecasts cuando la BD responde', async () => {
        mockedQuery.mockResolvedValueOnce({
            rows: [{ id: 1, created_at: '2025-01-01', value: 42 }]
        });
        const result = await (0, forecasts_1.getForecasts)();
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toMatchObject({ id: 1, value: 42 });
    });
    it('lanza error cuando la BD falla', async () => {
        mockedQuery.mockRejectedValueOnce(new Error('db fail'));
        await expect((0, forecasts_1.getForecasts)()).rejects.toThrow('db fail');
    });
});
