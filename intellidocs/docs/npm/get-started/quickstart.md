---
sidebar_position: 2
title: "Quick Start: AI Chatbot and Gen in Node.js"
sidebar_label: "Quick start"
description: "Install IntelliNode in Node.js and try chatbots, Gen helpers, and semantic search with OpenAI, Anthropic, and Gemini examples."
keywords: ["intellinode quick start","intellinode node.js","npm install intellinode","node.js chatbot library","openai anthropic gemini node.js","semantic search node.js"]
---

# Quick start


This guide helps you integrate intellinode in your Node.js project for basic tasks like chatbots, one-line generation and in-memory semantic search.

### Installation
Install IntelliNode using npm:

```bash
npm install intellinode
```

### Chatbot

Easily integrate and switch between chatbot providers:

```javascript
const { Chatbot, ChatGPTInput, AnthropicInput, GeminiInput, SupportedChatModels } = require('intellinode');

async function callChatbot(provider, apiKey, input) {
  input.addUserMessage('What is the capital of France?');

  // create chatbot instance
  const chatbot = new Chatbot(apiKey, provider);
  const responses = await chatbot.chat(input);

  console.log(responses[0]);
}

// call GPT-5.5 (the default openai model)
callChatbot(SupportedChatModels.OPENAI, 'your_openai_api_key', new ChatGPTInput('You are a helpful assistant.'));

// call Claude Sonnet 5 (the default anthropic model)
callChatbot(SupportedChatModels.ANTHROPIC, 'your_anthropic_api_key', new AnthropicInput('You are a helpful assistant.'));

// call Gemini with a specific model
callChatbot(SupportedChatModels.GEMINI, 'your_gemini_api_key', new GeminiInput('You are a helpful assistant.', { model: 'gemini-3.6-flash' }));
```

Replace `your_<model>_api_key` with your actual API key and explore other supported models. Every input class accepts `{ model, temperature, maxTokens }` in its second argument.

The same chatbot streams the answer, runs your tools and returns JSON that matches a schema:

```javascript
// stream
for await (const chunk of chatbot.stream(input)) process.stdout.write(chunk);

// JSON that matches a schema
const input = new ChatGPTInput('Answer as JSON.', { responseSchema: { type: 'object', properties: { city: { type: 'string' } } } });
input.addUserMessage('Where is the Eiffel Tower?');
const data = await chatbot.chatJson(input);   // { city: 'Paris' }
```

See [Tool calling](../chatbot/tool-calling) and [Structured output](../chatbot/structured-output) for the details.

### One-line generation

The `Gen` functions do a complete task in one call, with any provider:

```javascript
const { Gen } = require('intellinode');

const code = await Gen.generate_component('a pricing card with a CTA button', openaiKey, 'openai', { framework: 'react', styling: 'tailwind' });
const sql = await Gen.generate_sql('top 10 customers by order total', anthropicKey, 'anthropic', { dialect: 'postgresql' });
const review = await Gen.review_code(code, openaiKey);   // { summary, score, issues }
```

The full list is in the [Gen](../functions/gen/) section.

### Semantic Search

Find relevant items in your data using semantic similarity:

```javascript
const { SemanticSearch } = require('intellinode');

const apiKey = 'your_api_key';
const search = new SemanticSearch(apiKey);

// prepare the input
const pivotItem = 'Example search item';
const searchArray = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
const numberOfMatches = 3;

// perform the search
const results = await search.getTopMatches(pivotItem, searchArray, numberOfMatches);
```
