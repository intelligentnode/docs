---
sidebar_position: 2
---
# Embedding

The Embedding controller transform the text into high-dimensional vectors. These vectors encapsulate the semantic meaning of texts, enabling a variety of Natural Language Processing (NLP) applications:

- **Semantic search**: Enhances search functionalities by focusing on the meaning behind queries rather than just matching keywords.
- **Text clustering**: Group similar pieces of text, making it easier to organize large datasets.
- **Similarity comparison**: Measure how similar two pieces of text are, useful for recommendation systems or deduplicating content.

### Supported Providers

Choose from different AI providers for embedding generation: openai, cohere, gemini, nvidia, replicate, vllm, and the OpenAI-compatible services (openrouter, together, ollama, lmstudio, or openai_compatible with a baseUrl).

### Parameters

Provide the following parameters to use the embedding:

- **provider**: Identifier for the chosen AI provider (e.g., `'openai'`, `'cohere'`, `'gemini'`, `'ollama'`).
- **apiKey**: The authentication key required by the provider.
- **texts**: An array of strings. Each string can be a word, sentence, or paragraph.

Optional Parameters:
- **model**: Specifies the model variant from the provider for generating embeddings, if applicable.

### Example

Here's how to set up and use intellinode for generating vectors:

```javascript
const { RemoteEmbedModel, EmbedInput } = require('intellinode');

// instantiate the embedding controller
const embedModel = new RemoteEmbedModel('your_provider_api_key', 'openai');

// prepare the input
const input = new EmbedInput({ texts: ["This is a sentence.", "Exploring AI capabilities with IntelliNode."] });

// generate and print embeddings: [{ index, embedding: [...] }, ...]
const embeddings = await embedModel.getEmbeddings(input);
console.log(embeddings[0].embedding.length);
```

A local model through Ollama needs no key:

```javascript
const local = new RemoteEmbedModel(null, 'ollama');
const vectors = await local.getEmbeddings(new EmbedInput({ texts: ['hello world'], model: 'nomic-embed-text' }));
```
