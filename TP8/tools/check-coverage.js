const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..'); // TP7
const reports = {
  server: path.join(root, 'server', 'coverage', 'coverage-summary.json'),
  client: path.join(root, 'client', 'coverage', 'coverage-summary.json'),
};

const threshold = Number(process.env.COVERAGE_THRESHOLD || 70);
const mode = (process.env.COVERAGE_MODE || 'both').toLowerCase(); // 'both' or 'average'

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return null; }
}

function pctOf(report) {
  if (!report || !report.total) return null;
  // prefer statements, fallback to lines
  if (typeof report.total.statements?.pct === 'number') return report.total.statements.pct;
  if (typeof report.total.lines?.pct === 'number') return report.total.lines.pct;
  return null;
}

const server = readJson(reports.server);
const client = readJson(reports.client);

if (!server || !client) {
  console.error('Missing coverage reports:', [
    server ? null : reports.server,
    client ? null : reports.client,
  ].filter(Boolean).join(', '));
  process.exit(2);
}

const sPct = pctOf(server);
const cPct = pctOf(client);

if (sPct === null || cPct === null) {
  console.error('Unable to determine coverage pct from reports.');
  process.exit(2);
}

console.log(`Server statements: ${sPct}%`);
console.log(`Client statements: ${cPct}%`);

if (mode === 'average') {
  const avg = (sPct + cPct) / 2;
  console.log(`Average statements coverage: ${avg.toFixed(2)}% (threshold ${threshold}%)`);
  if (avg < threshold) {
    console.error('Coverage threshold not met (average).');
    process.exit(1);
  }
} else {
  // 'both' mode: each must meet threshold
  if (sPct < threshold || cPct < threshold) {
    console.error(`Coverage threshold not met. Required >= ${threshold}% per component.`);
    process.exit(1);
  }
}

console.log('Coverage threshold met.');
process.exit(0);