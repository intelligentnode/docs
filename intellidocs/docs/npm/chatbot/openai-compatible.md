---
sidebar_position: 5
---

# OpenAI-compatible providers

Any service with an OpenAI chat-completions API works with the same chatbot code: OpenRouter, Groq, DeepSeek, xAI, Together, a local Ollama or LM Studio, or your own endpoint.

### Presets

| Provider | Base URL | Default model |
| --- | --- | --- |
| `openrouter` | https://openrouter.ai/api/v1 | `openai/gpt-5.5` |
| `deepseek` | https://api.deepseek.com | `deepseek-chat` |
| `groq` | https://api.groq.com/openai/v1 | set `model` |
| `xai` | https://api.x.ai/v1 | set `model` |
| `together` | https://api.together.xyz/v1 | set `model` |
| `ollama` | http://localhost:11434/v1 | set `model`, no key needed |
| `lmstudio` | http://localhost:1234/v1 | set `model`, no key needed |
| `openai_compatible` | your `baseUrl` | set `model` |

### Chat

```javascript
const { Chatbot, OpenAICompatibleInput } = require('intellinode');

// hundreds of models through one key
const bot = new Chatbot(OPENROUTER_API_KEY, 'openrouter');
const input = new OpenAICompatibleInput('You are a helpful assistant.', { model: 'anthropic/claude-sonnet-5' });
input.addUserMessage('Who painted the Mona Lisa?');

const responses = await bot.chat(input);
```

The default model of a preset can be set once on the chatbot instead of every input:

```javascript
const groq = new Chatbot(GROQ_API_KEY, 'groq', null, { model: 'llama-3.3-70b-versatile' });
```

Extra headers, for example the OpenRouter attribution headers:

```javascript
const bot = new Chatbot(OPENROUTER_API_KEY, 'openrouter', null, {
  headers: { 'HTTP-Referer': 'https://my-app.example', 'X-OpenRouter-Title': 'My app' },
});
```

### Local models: Ollama and LM Studio

No key is needed; pick any model you pulled:

```javascript
const local = new Chatbot(null, 'ollama', null, { model: 'qwen3' });

console.log(await local.listModels());   // the models the server has

const input = new OpenAICompatibleInput('You are a helpful assistant.');
input.addUserMessage('Give me three names for a coffee shop.');

for await (const chunk of local.stream(input)) process.stdout.write(chunk);
```

`listModels()` is available for every compatible provider.

### Your own endpoint

```javascript
const custom = new Chatbot(MY_API_KEY, 'openai_compatible', null, {
  baseUrl: 'https://my-host/v1',
  model: 'my-model',
});
```

### Everything else works the same

Streaming, the [tool loop](./tool-calling), [structured output](./structured-output), the [retries & timeouts](./request-options) and every `Gen` function accept these providers:

```javascript
const { Gen } = require('intellinode');

const code = await Gen.generate_component('a pricing card', null, 'ollama', { model: 'qwen3' });
const data = await Gen.generate_json('Where is Rome?', schema, DEEPSEEK_API_KEY, 'deepseek');
```

A `ChatGPTInput` sent to a compatible provider is converted to a chat-completions request, so existing code can switch providers by changing the chatbot only.

### Embeddings

The embedding controller accepts the compatible providers that serve an embeddings endpoint (`openrouter`, `together`, `ollama`, `lmstudio`, or `openai_compatible` with a `baseUrl`):

```javascript
const { RemoteEmbedModel, EmbedInput } = require('intellinode');

const embed = new RemoteEmbedModel(null, 'ollama');
const vectors = await embed.getEmbeddings(new EmbedInput({ texts: ['hello world'], model: 'nomic-embed-text' }));
```
