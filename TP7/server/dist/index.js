"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const app_1 = __importDefault(require("./app"));
const crypto_1 = require("crypto");
const CLIENT_DIST = path_1.default.resolve(__dirname, '../../client/dist');
const CLIENT_URL = process.env.CLIENT_URL || 'https://tp6-client-PLACEHOLDER.a.run.app';
// Serve client build if it exists (middleware) — safe-guarded for tests
if (fs_1.default.existsSync(CLIENT_DIST)) {
    if (typeof app_1.default.use === 'function') {
        app_1.default.use(express_1.default.static(CLIENT_DIST));
    }
    // SPA fallback for client builds (only if app.get exists)
    if (typeof app_1.default.get === 'function') {
        app_1.default.get('*', (req, res, next) => {
            if (!req.path.startsWith('/api') && !req.path.includes('.')) {
                return res.sendFile(path_1.default.join(CLIENT_DIST, 'index.html'));
            }
            next();
        });
    }
}
// Always register root handler (tests expect app.get('/') to be called)
// Production: redirect to CLIENT_URL; Non-production: send simple message
if (typeof app_1.default.get === 'function') {
    if (process.env.NODE_ENV === 'production') {
        app_1.default.get('/', (_req, res) => {
            return res.redirect(CLIENT_URL);
        });
    }
    else {
        app_1.default.get('/', (_req, res) => {
            // If client build exists prefer serving index.html, otherwise send message
            if (fs_1.default.existsSync(CLIENT_DIST)) {
                return res.sendFile(path_1.default.join(CLIENT_DIST, 'index.html'));
            }
            return res.send('Server running. Use the client UI to interact.');
        });
    }
}
// Add /weatherforecast route only if app.get exists (keeps tests deterministic)
if (typeof app_1.default.get === 'function') {
    app_1.default.get('/weatherforecast', (_req, res) => {
        const count = Number(process.env.FORECAST_COUNT || 5);
        const summaries = ['Freezing', 'Bracing', 'Chilly', 'Cool', 'Mild', 'Warm', 'Balmy', 'Hot', 'Sweltering', 'Scorching'];
        const data = Array.from({ length: count }).map((_, i) => ({
            date: new Date(Date.now() + i * 86400000).toISOString(),
            // reemplazo seguro:
            temperatureC: (0, crypto_1.randomInt)(35) - 5, // 0..34 -> -5..29
            summary: summaries[(0, crypto_1.randomInt)(summaries.length)]
        }));
        res.json(data);
    });
}
// Start server only if app.listen exists (tests mock app without listen)
if (typeof app_1.default.listen === 'function') {
    const port = process.env.PORT ? Number(process.env.PORT) : 8080;
    app_1.default.listen(port, () => {
        console.log(`Server listening on port ${port} (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`);
    });
}
// ...existing code...
