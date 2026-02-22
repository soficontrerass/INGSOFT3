"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
// ...existing code...
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
async function runMigrations() {
    try {
        const migrationsDir = path_1.default.join(__dirname, '..', 'migrations');
        const migrationFiles = fs_1.default
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort((a, b) => a.localeCompare(b));
        for (const file of migrationFiles) {
            const sqlPath = path_1.default.join(migrationsDir, file);
            const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
            console.log(`Running migration ${file}`);
            await (0, db_1.query)(sql);
        }
        console.log('Migrations applied');
    }
    catch (err) {
        console.error('Migration failed', err);
        process.exitCode = 1;
    }
    finally {
        await (0, db_1.close)();
    }
}
void runMigrations();
// ...existing code...
