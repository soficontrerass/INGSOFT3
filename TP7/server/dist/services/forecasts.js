"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForecasts = getForecasts;
// ...existing code...
const db_1 = require("../db");
async function getForecasts() {
    const result = await (0, db_1.query)('SELECT id, created_at, value FROM forecasts ORDER BY id DESC LIMIT 100');
    return result?.rows ?? result;
}
// ...existing code...
