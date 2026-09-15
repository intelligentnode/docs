---
sidebar_position: 2
---

# Ask Any Model

The building blocks behind every other `Gen` function: one call for text, one call for parsed JSON.

### generate_text

```javascript
const text = await Gen.generate_text(prompt, apiKey, provider, options);
```

Returns the model text. `options.system` sets the system message (default: a helpful assistant).

```javascript
const { Gen } = require('intellinode');

const text = await Gen.generate_text('Explain event loops in two sentences.', anthropicKey, 'anthropic', { system: 'You are terse.' });
```

### generate_json

```javascript
const data = await Gen.generate_json(prompt, schema, apiKey, provider, options);
```

With a JSON Schema the provider's native structured output is used, so the reply matches the schema. With `null` the model is asked for JSON and the reply is parsed even when it is wrapped in prose or fences.

```javascript
const schema = {
  type: 'object',
  properties: { city: { type: 'string' }, country: { type: 'string' } },
  required: ['city', 'country'],
};

const data = await Gen.generate_json('Where is the Colosseum?', schema, openaiKey);
// { city: 'Rome', country: 'Italy' }

const list = await Gen.generate_json('Five JavaScript test frameworks as {"frameworks": [...]}', null, cohereKey, 'cohere');
```

The [Structured output](../../chatbot/structured-output) page lists the provider notes.

### instructUpdate

```javascript
const updated = await Gen.instructUpdate(modelOutput, userInstruction, type, apiKey, modelName, provider);
```

Updates a previous output based on a user instruction, for example to change the theme of a generated page. `type` describes the content (`'html'`, `'text'`, ...).
