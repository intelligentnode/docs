// Who used what: calls, tokens and fallbacks per team and provider, from logs/calls.jsonl.
//   node usage_report.js
const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync(path.join(__dirname, 'logs', 'calls.jsonl'), 'utf8').trim().split('\n');
const rows = {};
for (const record of lines.map((line) => JSON.parse(line))) {
  const key = `${record.team} | ${record.route} | ${record.provider || 'failed'}`;
  const row = rows[key] || (rows[key] = { calls: 0, tokens: 0, fallbacks: 0, ms: 0 });
  row.calls += 1;
  row.tokens += (record.usage && record.usage.total_tokens) || 0;
  row.fallbacks += (record.fallbacks || []).filter((f) => f.error).length;
  row.ms += record.ms || 0;
}
console.table(Object.fromEntries(Object.entries(rows).map(([key, r]) => [key, {
  calls: r.calls, tokens: r.tokens, 'providers that failed first': r.fallbacks, 'avg ms': Math.round(r.ms / r.calls),
}])));
