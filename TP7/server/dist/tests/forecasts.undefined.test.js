"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const db_1 = require("../db");
jest.mock('../db', () => ({ query: jest.fn() }));
const mockedQuery = db_1.query;
describe('Handle undefined DB result for forecasts', () => {
    afterEach(() => mockedQuery.mockReset());
    it('service: getForecasts returns undefined when query yields undefined', async () => {
        const { getForecasts } = require('../services/forecasts');
        mockedQuery.mockResolvedValueOnce(undefined);
        const res = await getForecasts();
        expect(res).toBeUndefined();
    });
    it('route: GET /api/forecasts returns 200 and empty/null body when query yields undefined', async () => {
        mockedQuery.mockResolvedValueOnce(undefined);
        const rsp = await (0, supertest_1.default)(app_1.default).get('/api/forecasts');
        expect(rsp.status).toBe(200);
        // aceptar body null, empty string o undefined según comportamiento de Express/supertest
        expect([null, '', undefined]).toContain(rsp.body);
    });
});
// ...existing code...
