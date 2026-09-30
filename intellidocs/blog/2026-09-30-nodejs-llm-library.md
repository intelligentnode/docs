---
slug: nodejs-llm-library
title: "How to Choose a Node.js LLM Library in 2026"
description: "How to choose a Node.js LLM library in 2026: provider SDKs, the Vercel AI SDK, LangChain.js, Mastra and IntelliNode compared, with code and trade-offs."
keywords: ["node js llm library", "javascript llm library", "langchain js alternative", "vercel ai sdk alternative", "typescript ai agent framework", "unified llm sdk", "node js ai agent framework", "intellinode"]
tags: [{label: "Node.js", permalink: "/nodejs"}, "LLM Libraries", "Comparison", "TypeScript"]
authors: [intellinode]
image: /img/articles/nodejs-llm-library.jpg
image_alt: "Translucent prisms of different heights along an arc, one circled by a lens, like picking one Node.js LLM library"
date: 2026-09-30T12:00:00Z
---

The first demo usually takes an afternoon. Someone wires a chatbot into the support tool, it answers a billing question nicely, and everyone is impressed. Six weeks later that feature has to look up real invoices, return answers a database can store, and survive a busy Monday. That's when your Node.js LLM library, the code your team uses to talk to large language models, starts to matter.

Almost any option gets you through the demo. What separates them is what comes after, and your team will live with the choice for about two years, so the real question is which trade-offs you can carry for that long.

Below we walk through the realistic options one at a time, with real numbers, working code and where each falls short, then end with a checklist.

![Translucent prisms of different heights along an arc, one circled by a lens, like picking one Node.js LLM library](/img/articles/nodejs-llm-library.jpg)

<!-- truncate -->

## What a Node.js LLM library should do for you

Every option can send a prompt and return text, so the demo proves little. The differences show up in the second month, when you add tools (functions the model asks your code to run), need JSON you can store, or hit a 429 (too many requests) at peak traffic. A useful library gives you:

- **One interface across models**, so switching vendor means changing a provider name and a key, not call sites.
- **Tool calling with a bounded loop**: the model asks for a function, your code runs it, and a step limit stops runaway loops. This loop is what most people call an agent.
- **Structured output** that follows a JSON Schema (a spec for the fields and types you expect), using each provider's native mode.
- **Streaming** for chat interfaces, so replies appear word by word, with cancellation.
- **Errors you can branch on**: timeouts, retries with backoff, and the HTTP status on the error, so a 429 can fall back to another model while a 401 (bad key) fails loudly.

Then come the business questions: how much code is tied to one vendor's format, whether a workload can move to a cheaper model without a sprint of refactoring, how long until the first feature ships, and who maintains it when its champion changes teams. With Python services too, ask whether prompts and tool schemas can be shared or will live twice.

## The options at a glance

Measured against that list, the realistic shortlist in 2026 is the provider SDKs that each vendor publishes for its own models (`openai`, `@anthropic-ai/sdk`, `@google/genai`), the Vercel AI SDK, LangChain.js with LangGraph.js, Mastra, the OpenAI Agents SDK, and lighter multi-provider libraries such as IntelliNode.

The table adds weekly downloads from the npm registry API for the week of 2026-09-22 to 2026-09-28 (`api.npmjs.org/downloads/point/last-week/<package>`), pulled on 2026-09-30. They include CI installs and transitive dependencies, so read them as ecosystem size, not quality. Each row then gets its own section.

| Option | npm package | Weekly downloads | Best when | Watch out for |
|---|---|---|---|---|
| Provider SDKs | `openai`, `@anthropic-ai/sdk`, `@google/genai` | 46.2M, 47.9M, 27.3M | One vendor, and you want its new features on day one | Each vendor has its own message, tool and stream format |
| Vercel AI SDK | `ai` | 31.6M | Web apps that stream chat into a React, Next.js, Vue or Svelte UI | Backend-only services use a fraction of it |
| LangChain.js and LangGraph.js | `langchain`, `@langchain/langgraph` | 3.40M, 4.02M | Many integrations, stateful graph agents, LangSmith tracing | More layers to learn and debug |
| Mastra | `@mastra/core` | 2.07M | A TypeScript agent framework with workflows, memory and evals in one place | Framework conventions your team has to adopt |
| OpenAI Agents SDK | `@openai/agents` | 2.19M | Several agents with handoffs, guardrails and tracing | Other providers go through an adapter; Node.js 22 or later |
| IntelliNode | `intellinode` | 405 | One small API across cloud and local models, plus MCP and a Python twin | Small community, no UI hooks, no graph engine |

### Provider SDKs: the baseline

The official SDKs are typed, maintained by the vendor, and get new features first. If you use one model family and will not change, they are the right call.

The cost shows up later. Each vendor has its own message format, tool schema and streaming events, so a tool loop written against `openai` has to be rewritten to run on Claude, tests included. Teams usually find this out the week procurement asks for a price comparison.

### Vercel AI SDK

Multi-provider libraries exist to avoid that rewrite, and the most used is the Vercel [AI SDK](https://ai-sdk.dev/docs), a TypeScript toolkit for AI apps and agents. AI SDK Core gives one API for text, structured objects, tool calls and agents. [AI SDK UI](https://ai-sdk.dev/docs/ai-sdk-ui/overview) adds `useChat`, `useCompletion` and `useObject` hooks, which manage chat state in the UI, for React, Svelte, Vue.js and Angular. Providers ship as packages such as `@ai-sdk/openai`, and Ollama (which runs open models on your own machine) is covered by a community provider.

It is the strongest choice when your product streams chat into a web UI. Check two things: a backend-only service uses just the Core half, and a Python team next to you will need a different library. Teams looking for a Vercel AI SDK alternative are usually in one of those two spots.

### LangChain.js and LangGraph.js

Where the AI SDK centers on the UI, [LangChain.js](https://github.com/langchain-ai/langchainjs) centers on integrations, with a very large catalog: model providers, tools, and the vector stores and retrievers used to search your own documents. LangGraph.js adds agents and controllable workflows built as graphs of explicit steps, and LangSmith covers testing and monitoring. It runs in Node.js, browsers, Deno, Bun and Cloudflare Workers.

Pick it for many integrations, stateful multi-step agents, or a tracing product (a timeline of every model call and tool step) your ops team already uses. The price is abstraction: for one prompt and two tools, there are several layers between your code and the HTTP request, and that is where debugging time goes.

### Mastra and the OpenAI Agents SDK

These two go a step further: they are frameworks you build inside, not libraries you call. [Mastra](https://github.com/mastra-ai/mastra) is a TypeScript framework with agents, a graph-based workflow engine (`.then()`, `.branch()`, `.parallel()`), memory, human-in-the-loop suspend and resume, MCP, evals, observability and routing to 40+ providers. MCP (Model Context Protocol) is an open standard for plugging tools into a model, and evals are automated tests of model output.

The [OpenAI Agents SDK](https://github.com/openai/openai-agents-js) centers on agents, handoffs (one agent passing work to another), guardrails (input and output checks), sessions and tracing, plus realtime voice agents. It calls itself provider agnostic and reaches other models through an AI SDK integration.

A TypeScript AI agent framework earns its structure when you have several agents, approval steps, and evals that gate a release. For a summarize endpoint, it is more framework than the job needs.

## Where IntelliNode fits

Those frameworks do a lot. The library we maintain does less, and since it's ours, we show it in more detail, limits included.

IntelliNode (`intellinode` on npm) sits at the light end: a unified LLM SDK, not a framework. One `Chatbot` class covers OpenAI, Anthropic, Gemini, Mistral, Cohere, NVIDIA and vLLM, plus presets for OpenAI-compatible services, which accept OpenAI's request format (OpenRouter, Groq, DeepSeek, xAI, Together, Ollama, LM Studio). It adds a tool loop, schema-based JSON, streaming, MCP and TypeScript types, and has a Python twin, Intelli.

### One call shape for OpenAI, Claude and a local model

The simplest case: one billing question sent to OpenAI, Claude, and a small local model through Ollama.

```javascript
const { Chatbot, ChatGPTInput, AnthropicInput, OpenAICompatibleInput } = require('intellinode');

const system = 'You are a billing support assistant. Answer in two sentences.';
const question = 'A customer was charged twice this month. What should we check first?';

async function ask(bot, input) {
  input.addUserMessage(question);
  const [answer] = await bot.chat(input);   // chat() resolves to an array of replies
  return answer;
}

async function main() {
  const openai = new Chatbot(process.env.OPENAI_API_KEY, 'openai');            // gpt-5.5, Responses API
  const claude = new Chatbot(process.env.ANTHROPIC_API_KEY, 'anthropic');      // claude-sonnet-5
  const local = new Chatbot(null, 'ollama', null, { model: 'qwen2.5:0.5b' });  // no key, runs on your machine

  console.log(await ask(openai, new ChatGPTInput(system, { effort: 'low' })));
  console.log(await ask(claude, new AnthropicInput(system, { maxTokens: 4096 })));   // Claude 5 thinking counts toward maxTokens
  console.log(await ask(local, new OpenAICompatibleInput(system)));
}
main();
```

Only the key, the provider name and the input class change. Claude 5 counts thinking toward `maxTokens`, so the 2048 default is raised. The local line needs no key, which makes it a free way to test the plumbing in CI. `Chatbot.createInput(bot.provider, system)` can pick the input class for you, as the one-file setup near the end shows.

### A tool calling agent in about 20 lines

Next, the second-month feature: a bounded tool loop that looks up an invoice.

```javascript
const { Chatbot, AnthropicInput } = require('intellinode');

const tools = [{
  name: 'get_invoice',
  description: 'Look up an invoice by id and return its amount and payment status',
  parameters: {
    type: 'object',
    properties: { invoiceId: { type: 'string' } },
    required: ['invoiceId'],
  },
  handler: async ({ invoiceId }) => ({ invoiceId, amount: 129, currency: 'USD', status: 'charged twice' }),
}];

async function main() {
  const bot = new Chatbot(process.env.ANTHROPIC_API_KEY, 'anthropic');
  const input = new AnthropicInput('You are a billing assistant. Always call get_invoice before answering.', { maxTokens: 4096 });
  input.addUserMessage('What is the status of invoice INV-2041?');

  const { text, steps } = await bot.runTools(input, tools, { maxSteps: 3 });
  console.log(steps.map((step) => step.name));   // [ 'get_invoice' ]
  console.log(text);
}
main();
```

`runTools` calls the model, runs every tool it asks for, sends the results back, and repeats until the model answers in text. `maxSteps` caps the tool rounds and the call throws after that, so a confused model cannot loop forever. The same call works with `ChatGPTInput`, `GeminiInput` and `OpenAICompatibleInput`. It appends tool turns to the input, so build a fresh input per request.

On local models: with `qwen2.5:0.5b` on Ollama, this agent called the tool in 3 of 6 runs and answered without it in the others. Use a capable model for agents. The [tool calling docs](/docs/npm/chatbot/tool-calling) cover handler errors and handling tool calls yourself, and [Build AI Agents in Node.js With Tools and MCP](/articles/build-ai-agents-nodejs) goes further.

### JSON that matches a schema

A ticket queue needs fields it can store, not prose, so here is structured output applied to support tickets.

```javascript
const { Chatbot, ChatGPTInput } = require('intellinode');

const ticketSchema = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: ['billing', 'bug', 'account', 'other'] },
    urgent: { type: 'boolean' },
    summary: { type: 'string' },
  },
  required: ['category', 'urgent', 'summary'],
};

async function main() {
  const bot = new Chatbot(process.env.OPENAI_API_KEY, 'openai');
  const input = new ChatGPTInput('Classify the support ticket.', { responseSchema: ticketSchema, strictSchema: true });
  input.addUserMessage('I was charged twice for my March invoice and need a refund today.');

  const ticket = await bot.chatJson(input);   // a parsed object, not a string
  console.log(ticket.category, ticket.urgent, ticket.summary);
}
main();
```

With `responseSchema` set, `chatJson` uses each provider's native structured output (OpenAI, Anthropic, Gemini, and `response_format` on compatible providers) and returns a parsed object. `strictSchema: true` turns on OpenAI strict mode.

`chatJson` itself only confirms the reply is an object, or an array if the schema says so. Required fields and types come from the provider's structured output mode, so validate business data with a validator such as ajv before it reaches your database. A schema also guarantees shape, not truth: on the local 0.5B model, the double-charge ticket sometimes came back as `account` instead of `billing`. More in the [structured output guide](/docs/npm/chatbot/structured-output).

### Streaming, MCP and the browser

Three smaller features round it out.

- **Streaming:** `for await (const chunk of bot.stream(input))` works for OpenAI, Anthropic, Mistral, Cohere, NVIDIA, vLLM and every OpenAI-compatible provider, local Ollama included. Gemini, Replicate and SageMaker need `chat()`, and tool calls are not surfaced through `stream()`.
- **MCP:** pass an `MCPClient` straight into `runTools` and the model uses that server's tools. `MCPServer` exposes your own functions over stdio or Streamable HTTP, and `npx -y intellinode mcp` gives Claude Code, Cursor or VS Code 15 cross-provider tools. See [MCP in Node.js](/docs/npm/mcp/get-started).
- **Browser:** a script-tag bundle exposes a global `IntelliNode`, fine for local models and demos but not for paid keys.

### What IntelliNode does not do

For a two-year decision, what a library leaves out matters as much as what it does, since each gap is code you'd write yourself.

- **No UI hooks.** For `useChat`-style state in React, the AI SDK is the better fit.
- **No graph workflow engine, memory store or tracing UI.** Orchestration is plain JavaScript: fine for three steps, tedious for thirty.
- **No tool calls on Cohere.** `runTools` there returns the model's text with zero steps and no error.
- **Node-only pieces.** `CodingAgent` and `MCPServer` are not in the browser bundle.
- **A much smaller community.** 405 downloads that week against millions for the leaders means fewer forum answers and more reading of the source.

## How to choose a Node.js LLM library: a decision checklist

You've now seen every option and where each falls short. To turn that into a decision, go through these questions in order. The first yes usually decides it.

1. **Do you stream chat into a React, Next.js, Vue, Svelte or Angular UI?** Start with the Vercel AI SDK.
2. **Is one vendor fixed for the next year** by contract, committed spend or a compliance review? Use its SDK and keep the calls behind one module.
3. **Do you need stateful multi-step workflows, approval pauses and tracing?** LangGraph.js or Mastra, or the OpenAI Agents SDK for several cooperating agents on OpenAI models.
4. **Must some data stay on your own hardware?** Pick a library where local models share the cloud code path, like IntelliNode's `ollama` and `lmstudio` presets.
5. **Is there a Python side?** Look for a Python counterpart with the same concepts, so prompts and tool schemas carry over. IntelliNode's is Intelli, with the same `Chatbot` idea and JSON Schema [tool calling](/docs/python/chatbot/tool-calling), though there you run the tool loop yourself.
6. **Who maintains it?** Two backend engineers do better with fewer abstractions. A platform team serving ten product teams can justify a framework.

Here is the same checklist as a flow you can follow from the top:

![Decision flow for choosing a Node.js LLM library: web UI streaming, a fixed vendor, stateful workflows, on-premises data and a Python team each point to a different option](pathname:///img/articles/diagrams/nodejs-llm-library-decision.svg)

*Follow the questions from the top and stop at the first yes.*

### A scenario most SaaS teams will recognize

A 40-person B2B SaaS company runs a Node.js API and a two-person Python data team. Support wants AI ticket triage: classify, pull the invoice, draft a reply. Then two constraints land: an enterprise contract says ticket text may not go to an outside model provider, and finance wants cost per ticket tracked before the feature reaches every tenant.

A provider SDK ships the first version fastest, but the enterprise tenant then needs a second code path. LangGraph.js or Mastra would work, though a three-step flow is small for a graph. The AI SDK fits if the agent assist panel lives in their Next.js dashboard. With IntelliNode the team keeps one `createBot()` function: Claude for most tenants, Ollama for the enterprise one, the same `chatJson` schema for both, and prompts the data team can reuse in Python with Intelli. Several options would work. What decided it was the on-premises tenant and the size of the team.

## Switching later without a rewrite

The single `createBot()` function in that scenario is a habit worth copying with any library. Whatever you pick, keep one file that knows the vendor. The rest of the codebase calls `answer()` and never imports a provider package.

```javascript
// llm.js: the only file that knows which vendor serves a request
const { Chatbot } = require('intellinode');

const KEYS = { openai: 'OPENAI_API_KEY', anthropic: 'ANTHROPIC_API_KEY', gemini: 'GEMINI_API_KEY' };
const REQUEST = { timeout: 30000, retries: 2 };

function createBot(provider = process.env.LLM_PROVIDER || 'openai') {
  if (provider === 'ollama') {
    return new Chatbot(null, 'ollama', null, { ...REQUEST, model: process.env.OLLAMA_MODEL || 'qwen2.5:0.5b' });
  }
  return new Chatbot(process.env[KEYS[provider]], provider, null, REQUEST);
}

async function answer(system, question) {
  const bot = createBot();
  const input = Chatbot.createInput(bot.provider, system, { maxTokens: 4096 });
  input.addUserMessage(question);
  const [reply] = await bot.chat(input);
  return reply;
}

module.exports = { createBot, answer };
```

Moving the app to Gemini, or one tenant to a local model, is now an environment variable. `timeout` applies per attempt, retries back off on 429, most 5xx responses and network errors, and the thrown error carries `status` (or `code` on a timeout), so fallback logic can tell a rate limit from a bad key.

OpenAI-compatible endpoints widen the choice without new code. `new Chatbot(process.env.OPENROUTER_API_KEY, 'openrouter')` reaches the models OpenRouter hosts, and the groq, deepseek, xai, together, ollama and lmstudio presets work the same way (all except deepseek need a `model` in the options). Details in [OpenAI-compatible providers](/docs/npm/chatbot/openai-compatible).

Switching is only half the job. Before you move traffic to a cheaper model, measure it on your own prompts:

```javascript
const { LLMEvaluation } = require('intellinode');

async function main() {
  // the embedding provider that scores the answers: openai, cohere, gemini, replicate or openrouter
  const evaluation = new LLMEvaluation(process.env.OPENAI_API_KEY, 'openai');

  const results = await evaluation.compareModels(
    'A customer was charged twice. What should support do first?',
    ['Confirm the duplicate charge with the payment provider, refund it, and tell the customer when the money will arrive.'],
    [
      { apiKey: process.env.ANTHROPIC_API_KEY, provider: 'anthropic', type: 'chat', model: 'claude-sonnet-5', maxTokens: 2048 },
      { apiKey: process.env.OPENAI_API_KEY, provider: 'openai', type: 'chat', model: 'gpt-5.5' },
      { apiKey: null, provider: 'ollama', type: 'chat', model: 'qwen2.5:0.5b', maxTokens: 300 },
    ],
  );

  for (const [lane, runs] of Object.entries(results)) {
    if (lane !== 'lookup') console.log(lane, runs[0].stop_reason, runs[0].score_cosine_similarity);
  }
}
main();
```

`compareModels` sends the same prompt to each lane (one model setup), embeds every answer (turns it into numbers that capture its meaning), and scores it against your reference answers (cosine similarity, Euclidean and Manhattan distance). A failing lane is recorded with `stop_reason: 'error'` instead of stopping the run. Treat the score as a measure of semantic closeness rather than correctness, and run it over 50 real tickets before you trust it. See [LLM evaluation](/docs/npm/functions/llm-evaluation).

## FAQ

Short answers for readers who skipped ahead.

### What is the best Node.js LLM library in 2026?

There is no single winner. Streaming chat inside a React or Next.js product points to the Vercel AI SDK, stateful agent workflows with tracing to LangGraph.js or Mastra, and a vendor you will never change to its own SDK. One small backend API across OpenAI, Claude, Gemini and local models, with a Python twin, is where IntelliNode fits. The checklist above usually settles it.

### Is IntelliNode a LangChain.js alternative?

For many backend features, yes: chat across providers, a tool loop, schema-based JSON, streaming and MCP, with fewer layers. It does not replace LangChain's integration catalog, LangGraph's stateful graphs or LangSmith tracing, so teams that depend on those should stay.

### Does IntelliNode support TypeScript?

Yes. The package ships `index.d.ts` covering `Chatbot`, every input class, `runTools`, `chatJson` and the MCP classes, so no `@types` package is needed. The build is CommonJS and ESM named imports work too. It is not TypeScript-first the way Mastra is.

### Can a JavaScript LLM library run in the browser?

Several can. LangChain.js lists browsers among its environments, and IntelliNode ships a script tag bundle with `Chatbot`, `runTools`, `chatJson`, `stream` and `MCPClient` over HTTP. The hard part is the key: anything in the page is public, so paid keys belong on a server.

### Does IntelliNode work with OpenRouter, Groq and Ollama?

Yes. They are built-in presets of the OpenAI-compatible provider. `openrouter` defaults to `openai/gpt-5.5`, while `groq` and `ollama` need a model name. Local presets need no key, and `listModels()` returns the models the server offers.

## Try it on your own prompts

Our tests above are only a starting point, so run your own. Start with the local model, since it needs no key and no budget approval:

```bash
npm i intellinode
ollama pull qwen2.5:0.5b
```

Run the local line from the first example, then point `createBot()` at your hosted provider and try a real prompt from your backlog. The [installation guide](/docs/npm/get-started/installation) covers Node.js versions, TypeScript imports and the browser bundle.
