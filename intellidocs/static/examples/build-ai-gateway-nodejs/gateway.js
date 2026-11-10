// A small, self-hosted AI gateway. Your apps call one OpenAI-compatible endpoint with a gateway key;
// the gateway picks the provider, falls back when one fails, and logs who used what.
//   node gateway.js      then point any OpenAI client at http://localhost:8787/v1
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Chatbot } = require('intellinode');
const routes = require('./routes');

const PORT = Number(process.env.GATEWAY_PORT || 8787);
// one key per team, so the log shows who spent what: "support:key-one,sales:key-two"
const TEAMS = Object.fromEntries((process.env.GATEWAY_KEYS || 'demo:demo-key')
  .split(',').map((pair) => pair.split(':').reverse()));
const LOG = path.join(__dirname, 'logs', 'calls.jsonl');
fs.mkdirSync(path.dirname(LOG), { recursive: true });

// A 400 means the request itself is wrong, so another provider would fail too. Everything else
// (rate limits, outages, timeouts, a refused connection, a wrong key on one provider) is worth a retry elsewhere.
function worthTryingNext(error) {
  if (error.name === 'AbortError') return false;
  if (!error.status) return true;
  return ![400, 404, 413, 422].includes(error.status);
}

function makeBot(entry) {
  const key = entry.keyEnv ? process.env[entry.keyEnv] : null;
  // one quick retry per provider: the next provider in the route is the real retry
  const options = { model: entry.model, timeout: 30000, retries: 1, ...(entry.baseUrl && { baseUrl: entry.baseUrl }) };
  return new Chatbot(key || 'none', entry.provider, null, options);
}

function buildInput(entry, messages, maxTokens) {
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n') || 'You are a helpful assistant.';
  const input = Chatbot.createInput(entry.provider, system, { model: entry.model, ...(maxTokens && { maxTokens }) });
  for (const m of messages) {
    if (m.role === 'user') input.addUserMessage(m.content);
    if (m.role === 'assistant') input.addAssistantMessage(m.content);
  }
  return input;
}

async function complete(routeName, messages, maxTokens) {
  const tried = [];
  for (const entry of routes[routeName]) {
    const name = entry.label || `${entry.provider}/${entry.model}`;
    if (entry.keyEnv && !process.env[entry.keyEnv]) {
      tried.push({ provider: name, skipped: `${entry.keyEnv} is not set` });
      continue;
    }
    const started = Date.now();
    try {
      const bot = makeBot(entry);
      const [text] = await bot.chat(buildInput(entry, messages, maxTokens));
      const usage = (bot.lastResponse && bot.lastResponse.usage) || null;
      return { text, entry, name, usage, ms: Date.now() - started, tried };
    } catch (error) {
      tried.push({ provider: name, error: error.status || error.code || error.message.slice(0, 80), ms: Date.now() - started });
      if (!worthTryingNext(error)) throw Object.assign(error, { tried });
    }
  }
  throw Object.assign(new Error(`Every provider in the "${routeName}" route failed.`), { status: 503, tried });
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
  });
}

http.createServer(async (req, res) => {
  const team = TEAMS[(req.headers.authorization || '').replace(/^Bearer\s+/i, '')];
  if (!team) return send(res, 401, { error: { message: 'Unknown gateway key.' } });

  if (req.method === 'GET' && req.url === '/v1/models') {
    return send(res, 200, { object: 'list', data: Object.keys(routes).map((id) => ({ id, object: 'model', owned_by: 'gateway' })) });
  }
  if (req.method !== 'POST' || req.url !== '/v1/chat/completions') {
    return send(res, 404, { error: { message: 'Use POST /v1/chat/completions or GET /v1/models.' } });
  }

  let body;
  try { body = await readJson(req); } catch { return send(res, 400, { error: { message: 'The body is not valid JSON.' } }); }
  const routeName = body.model;
  if (!routes[routeName]) return send(res, 400, { error: { message: `Unknown model "${routeName}". Use one of: ${Object.keys(routes).join(', ')}.` } });

  const record = { time: new Date().toISOString(), team, route: routeName };
  try {
    const result = await complete(routeName, body.messages || [], body.max_tokens);
    Object.assign(record, { provider: result.name, ms: result.ms, usage: result.usage, fallbacks: result.tried });
    send(res, 200, {
      id: `gw-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: result.entry.model,
      choices: [{ index: 0, message: { role: 'assistant', content: result.text }, finish_reason: 'stop' }],
      ...(result.usage && { usage: result.usage }),
    }, { 'x-gateway-provider': result.name });
  } catch (error) {
    Object.assign(record, { failed: error.message.slice(0, 120), fallbacks: error.tried || [] });
    // the client sees what was tried, so "no key set" and "rate limited" are easy to tell apart
    send(res, error.status && error.status < 500 ? error.status : 503, { error: { message: error.message.slice(0, 300), tried: error.tried || [] } });
  } finally {
    fs.appendFileSync(LOG, JSON.stringify(record) + '\n');
  }
}).listen(PORT, () => console.log(`AI gateway on http://localhost:${PORT}/v1, routes: ${Object.keys(routes).join(', ')}`));
