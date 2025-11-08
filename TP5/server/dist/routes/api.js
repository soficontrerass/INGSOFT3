"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const router = express_1.default.Router();
router.get('/health', async (_req, res) => {
    try {
        // check db connectivity if configured
        if (process.env.DB_NAME || process.env.DATABASE_URL) {
            await (0, db_1.query)('SELECT 1');
        }
        res.json({ status: 'ok' });
    }
    catch (err) {
        console.error('health check error', err);
        res.status(500).json({ status: 'error', error: err.message });
    }
});
// ...existing code...
exports.default = router;
