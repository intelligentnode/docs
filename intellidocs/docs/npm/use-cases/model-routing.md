---
sidebar_position: 6
---

# Model routing and resilience

A product that depends on one model provider inherits its outages, its rate limits and its prices. Enterprises also have data that must not leave the network, and teams that want to try a cheaper model without rewriting the integration.

Because every provider is behind the same chatbot interface, routing becomes a small function: pick the provider per request, fall back when one fails, keep private traffic on premise, and measure the candidates before switching.

<img src="/img/use-cases/model-routing.jpg" width="100%" alt="A control tower routing requests to several model servers" />

<svg viewBox="0 0 760 230" width="100%" role="img" aria-label="Routing requests to providers">
  <defs>
    <marker id="mrArrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <path d="M0,0 L10,4 L0,8 z" fill="#64748b" />
    </marker>
  </defs>
  <rect x="15" y="80" width="140" height="70" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
  <text x="85" y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">Request</text>
  <text x="85" y="130" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">task, sensitivity</text>
  <line x1="155" y1="115" x2="215" y2="115" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#mrArrow)" />
  <rect x="220" y="80" width="150" height="70" rx="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
  <text x="295" y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">Router</text>
  <text x="295" y="130" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">policy + fallback</text>
  <line x1="370" y1="100" x2="440" y2="45" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#mrArrow)" />
  <line x1="370" y1="115" x2="440" y2="115" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#mrArrow)" />
  <line x1="370" y1="130" x2="440" y2="185" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#mrArrow)" />
  <rect x="445" y="15" width="150" height="60" rx="10" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
  <text x="520" y="40" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="600" fill="#065f46">OpenAI / Anthropic</text>
  <text x="520" y="58" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#059669">quality first</text>
  <rect x="445" y="85" width="150" height="60" rx="10" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
  <text x="520" y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="600" fill="#065f46">OpenRouter / Groq</text>
  <text x="520" y="128" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#059669">cost and speed</text>
  <rect x="445" y="155" width="150" height="60" rx="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
  <text x="520" y="180" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="600" fill="#92400e">Ollama / vLLM</text>
  <text x="520" y="198" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#b45309">private data, on premise</text>
  <text x="680" y="120" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="11" fill="#64748b">one input class</text>
  <text x="680" y="136" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="11" fill="#64748b">per provider</text>
</svg>

### 1. One place that creates chatbots

Keep the provider choice in a registry. Timeouts and retries are set once here and apply to every request.

```javascript
const { Chatbot, SupportedChatModels } = require('intellinode');

const REQUEST = { timeout: 30000, retries: 2, retryDelay: 500 };

const providers = {
  quality: () => new Chatbot(process.env.ANTHROPIC_API_KEY, SupportedChatModels.ANTHROPIC, null, REQUEST),
  fast: () => new Chatbot(process.env.OPENAI_API_KEY, SupportedChatModels.OPENAI, null, REQUEST),
  cheap: () => new Chatbot(process.env.OPENROUTER_API_KEY, 'openrouter', null, { ...REQUEST, model: 'meta-llama/llama-4-maverick' }),
  private: () => new Chatbot(null, 'ollama', null, { ...REQUEST, model: 'qwen3', timeout: 120000 }),
};
```

`Chatbot.createInput(provider, system, options)` returns the right input class, so the routing code never mentions `ChatGPTInput` or `AnthropicInput`:

```javascript
async function ask(lane, system, question) {
  const bot = providers[lane]();
  const input = Chatbot.createInput(bot.provider, system, { maxTokens: 2048 });
  input.addUserMessage(question);
  const [reply] = await bot.chat(input);
  return reply;
}
```

### 2. Route by policy

```javascript
function laneFor(request) {
  if (request.containsPersonalData) return 'private';   // never leaves the network
  if (request.task === 'summarize' || request.task === 'classify') return 'cheap';
  if (request.task === 'draft_contract') return 'quality';
  return 'fast';
}

const answer = await ask(laneFor(request), 'You are a helpful assistant.', request.text);
```

### 3. Fall back in order

Errors carry the HTTP status and a code for timeouts, so the fallback only triggers for problems on the provider side.

```javascript
const ORDER = ['fast', 'quality', 'cheap'];

function isProviderProblem(error) {
  return error.code === 'ETIMEDOUT' || error.status === 429 || (error.status && error.status >= 500);
}

async function askWithFallback(system, question) {
  let lastError;
  for (const lane of ORDER) {
    try {
      return await ask(lane, system, question);
    } catch (error) {
      if (!isProviderProblem(error)) throw error;
      lastError = error;
      console.warn(`${lane} unavailable (${error.status || error.code}), trying the next lane`);
    }
  }
  throw lastError;
}
```

### 4. Cancel what the user no longer waits for

A request that outlives its web request should stop consuming tokens. Pass the same `AbortSignal` to the chatbot.

```javascript
app.post('/assist', async (req, res) => {
  const controller = new AbortController();
  req.on('close', () => controller.abort());

  const bot = new Chatbot(process.env.OPENAI_API_KEY, 'openai', null, { ...REQUEST, signal: controller.signal });
  const input = Chatbot.createInput('openai', 'You are a helpful assistant.');
  input.addUserMessage(req.body.question);

  res.setHeader('Content-Type', 'text/plain');
  for await (const chunk of bot.stream(input)) res.write(chunk);
  res.end();
});
```

### 5. Measure before you switch

`LLMEvaluation` runs the same prompts on several providers and scores the answers against the expected ones, so the cheaper lane is a decision, not a guess.

```javascript
const { LLMEvaluation } = require('intellinode');

const evaluation = new LLMEvaluation(process.env.OPENAI_API_KEY, 'openai');

const results = await evaluation.compareModels(
  'Explain what a rate limit is in one sentence.',
  ['A rate limit caps how many requests a client may send in a period of time.'],
  [
    { apiKey: process.env.OPENAI_API_KEY, provider: 'openai', type: 'chat', model: 'gpt-5.5' },
    { apiKey: process.env.ANTHROPIC_API_KEY, provider: 'anthropic', type: 'chat', model: 'claude-sonnet-5' },
    { apiKey: process.env.MISTRAL_API_KEY, provider: 'mistral', type: 'chat', model: 'mistral-medium-latest' },
  ],
);
console.log(results);
```

### Why it helps

- One integration, every provider: switching models is configuration, not a rewrite.
- Outages and rate limits degrade to the next lane instead of failing the product.
- Private data has a lane that never leaves the network, on the same code path as the rest.
