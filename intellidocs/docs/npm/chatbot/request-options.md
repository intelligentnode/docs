---
sidebar_position: 6
title: "Retries, Timeouts and Cancellation in Node.js"
sidebar_label: "Retries & Timeouts"
description: "Configure IntelliNode request timeouts, retries with backoff, AbortSignal cancellation, global defaults, and HTTP error handling in Node.js."
keywords: ["intellinode request options","node.js chatbot retries","node.js request timeout","abortsignal intellinode","intellinode error handling","fetchclient configure"]
---

# Retries & Timeouts

Every request made by intellinode goes through one HTTP layer with a timeout, retries with backoff and `AbortSignal` support. The options are the same for every provider.

### Per chatbot

```javascript
const { Chatbot, ChatGPTInput } = require('intellinode');

const controller = new AbortController();

const bot = new Chatbot(OPENAI_API_KEY, 'openai', null, {
  timeout: 30000,      // ms per attempt (default 300000)
  retries: 2,          // retries on 408, 409, 425, 429, 500, 502, 503, 504 and network errors (default 2)
  retryDelay: 500,     // base delay in ms, doubled per attempt, Retry-After is honoured (default 500)
  signal: controller.signal,
});

const input = new ChatGPTInput('You are a helpful assistant.');
input.addUserMessage('Write a long story.');

setTimeout(() => controller.abort(), 5000);

try {
  await bot.chat(input);
} catch (error) {
  if (error.name === 'AbortError') console.log('cancelled');
}
```

`bot.setRequestOptions({ timeout, retries, retryDelay, signal })` changes the options of an existing chatbot. The `Gen` functions accept the same keys in their options object.

### Global defaults

```javascript
const { FetchClient } = require('intellinode');

FetchClient.configure({ timeout: 60000, retries: 1 });
```

The defaults apply to every wrapper created afterwards.

### Errors

Errors keep the details of the HTTP layer:

- `error.status` and `error.body`: the HTTP status and response text of a failed request.
- `error.code === 'ETIMEDOUT'`: the timeout fired (before or during the response).
- `error.name === 'AbortError'`: the caller's signal was aborted.

```javascript
try {
  await bot.chat(input);
} catch (error) {
  if (error.status === 429) console.log('rate limited', error.body);
  else if (error.code === 'ETIMEDOUT') console.log('too slow');
  else throw error;
}
```

Streams are cancelled when you stop reading them: breaking out of a `for await` loop closes the connection.
