"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
const app_1 = __importDefault(require("./app"));
const CLIENT_URL = process.env.CLIENT_URL || 'https://tp6-client-PLACEHOLDER.a.run.app';
// Redirect root to the deployed client only in production
if (process.env.NODE_ENV === 'production') {
    app_1.default.get('/', (_req, res) => res.redirect(CLIENT_URL));
}
else {
    app_1.default.get('/', (_req, res) => res.send('Server running. Use the client UI to interact.'));
}
const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app_1.default.listen(port, () => {
    console.log(`Server listening on port ${port} (FORECAST_COUNT=${process.env.FORECAST_COUNT || '5'})`);
});
