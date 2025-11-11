const fs = require('fs');
const path = require('path');

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return null; }
}

const root = path.join(__dirname, '..'); // TP7
const serverSummary = readJson(path.join(root, 'server', 'coverage', 'coverage-summary.json'));
const clientSummary = readJson(path.join(root, 'client', 'coverage', 'coverage-summary.json'));

if (!serverSummary) {
  console.error('Missing server coverage-summary.json at TP7/server/coverage/coverage-summary.json');
  process.exit(1);
}
if (!clientSummary) {
  console.error('Missing client coverage-summary.json at TP7/client/coverage/coverage-summary.json');
  process.exit(1);
}

const sPct = serverSummary.total.lines.pct;
const cPct = clientSummary.total.lines.pct;
const min = parseFloat(process.env.COVERAGE_THRESHOLD || '70');

console.log(`Server lines pct: ${sPct}%`);
console.log(`Client lines pct: ${cPct}%`);
if (sPct < min || cPct < min) {
  console.error(`Coverage threshold not met (min ${min}%).`);
  process.exit(1);
}
console.log('Coverage threshold met.');
process.exit(0);