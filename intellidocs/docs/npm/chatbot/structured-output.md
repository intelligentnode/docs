---
sidebar_position: 4
title: "Structured JSON Output from LLMs in Node.js"
sidebar_label: "Structured output"
description: "Use IntelliNode chatJson to request parsed JSON with JSON Schema validation across OpenAI, Anthropic, Gemini, Mistral, Cohere and compatible APIs."
keywords: ["node.js structured output","intellinode chatjson","json schema llm response","openai json schema node.js","anthropic json output","gemini structured output"]
---

# Structured output

Ask any provider for JSON and get a parsed object back. With a JSON Schema the provider's native structured output is used, so the reply matches the schema.

### chatJson

```javascript
const { Chatbot, ChatGPTInput } = require('intellinode');

const schema = {
  type: 'object',
  properties: {
    city: { type: 'string' },
    country: { type: 'string' },
    population: { type: 'integer' },
  },
  required: ['city', 'country', 'population'],
};

const bot = new Chatbot(OPENAI_API_KEY, 'openai');
const input = new ChatGPTInput('Answer as JSON.', { responseSchema: schema });
input.addUserMessage('Where is the Eiffel Tower?');

const data = await bot.chatJson(input);
// { city: 'Paris', country: 'France', population: 2102650 }
```

`chatJson` sends the request, then parses the first reply. The reply is parsed even when a model wraps it in prose or code fences, and the result is validated against the schema type (an object schema rejects an array reply).

### Input options

- `responseSchema`: a JSON Schema for the reply. Sent as native structured output on OpenAI (chat completions and the Responses API), Anthropic, Gemini, Mistral, Cohere and the OpenAI-compatible services.
- `responseFormat: 'json'`: free-form JSON without a schema (OpenAI `json_object` mode; on Claude it becomes a system instruction).
- `strictSchema: true`: OpenAI strict mode. Every object gets `additionalProperties: false` and optional properties become required and nullable, as strict mode demands.

The same options work on `AnthropicInput`, `GeminiInput`, `MistralInput`, `CohereInput`, `NvidiaInput`, `VLLMInput` and `OpenAICompatibleInput`:

```javascript
const { AnthropicInput, SupportedChatModels } = require('intellinode');

const claude = new Chatbot(ANTHROPIC_API_KEY, SupportedChatModels.ANTHROPIC);
const input = new AnthropicInput('Answer as JSON.', { responseSchema: schema });
input.addUserMessage('Where is the Colosseum?');

const data = await claude.chatJson(input);   // { city: 'Rome', country: 'Italy', population: ... }
```

Provider notes:
- Gemini receives the schema without `$schema` and `additionalProperties`, which its dialect rejects.
- Anthropic requires closed objects; intellinode adds `additionalProperties: false` where it is missing.
- DeepSeek only supports `json_object`; the schema is added to the system message and the reply is still parsed and checked.

### One-line JSON with Gen

`Gen.generate_json` does the same in one call:

```javascript
const { Gen } = require('intellinode');

const data = await Gen.generate_json('Where is the Colosseum?', schema, OPENAI_API_KEY, 'openai');

// free-form JSON without a schema
const facts = await Gen.generate_json('Three facts about Rome as {"facts": [...]}', null, ANTHROPIC_API_KEY, 'anthropic');
```

### Parsing helpers

`OutputParser` exposes the parsers used internally, useful when you call `chat()` directly:

```javascript
const { OutputParser } = require('intellinode');

const object = OutputParser.parseJson('Sure! ```json\n{"a": 1}\n```', 'object');   // { a: 1 }
const code = OutputParser.extractCode('```js\nconsole.log(1)\n```', 'js');         // 'console.log(1)'
```
