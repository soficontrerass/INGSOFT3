"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.resetModules();
// mockear db con query y close (migrate llama a close en tu código)
jest.mock('../db', () => ({ query: jest.fn(), close: jest.fn() }));
const db_1 = require("../db");
describe('migrate', () => {
    it('runs migrations and calls db.query and db.close', async () => {
        db_1.query.mockResolvedValueOnce({});
        // require migrate después de mockear db
        const migrate = require('../migrate');
        if (typeof migrate.runMigrations === 'function') {
            await expect(migrate.runMigrations()).resolves.not.toThrow();
            expect(db_1.query).toHaveBeenCalled();
            // si migrate llama a close al final
            expect(db_1.close).toHaveBeenCalled();
        }
        else if (typeof migrate.default === 'function') {
            await expect(migrate.default()).resolves.not.toThrow();
            expect(db_1.query).toHaveBeenCalled();
            expect(db_1.close).toHaveBeenCalled();
        }
        else {
            // si ejecuta en import
            expect(db_1.query).toHaveBeenCalled();
        }
    });
});
