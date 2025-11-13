"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
async function run() {
    try {
        const sqlPath = path_1.default.join(__dirname, '..', 'migrations', '001_init.sql');
        const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
        console.log('Running migration 001_init.sql');
        await (0, db_1.query)(sql);
        console.log('Migration applied');
    }
    catch (err) {
        console.error('Migration failed', err);
        process.exitCode = 1;
    }
    finally {
        await (0, db_1.close)();
    }
}
run();
// ...existing code...