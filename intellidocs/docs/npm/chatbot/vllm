---
sidebar_position: 4
---

# vLLM Integration

IntelliNode provides seamless integration with **self-hosted vLLM models**.

## Supported Models

Examples of commonly used vLLM models include:

| Model Name                                   | Description                   |
|----------------------------------------------|-------------------------------|
| `meta-llama/Llama-3.1-8B-Instruct`           | Llama3 instruct model         |
| `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`   | DeepSeek distilled model      |
| `BAAI/bge-small-en-v1.5`                     | Embedding model               |

> **Note:** vLLM supports many other models hosted locally or remotely.

---

## Setup & Usage

### Chat Completion

**Step 1:** Import required modules.

```javascript
const { Chatbot, VLLMInput, SupportedChatModels } = require('intellinode');
```

**Step 2:** Set your vLLM server URL.

```javascript
const vllmUrl = 'http://localhost:8000';
const chatbot = new Chatbot(null, SupportedChatModels.VLLM, null, { baseUrl: vllmUrl });
```

**Step 3:** Create input and add user message.

```javascript
const input = new VLLMInput('You are a helpful assistant.', {
  model: 'meta-llama/Llama-3.1-8B-Instruct',
  maxTokens: 100,
  temperature: 0.7
});

input.addUserMessage('What is machine learning?');
```

**Step 4:** Get response from your chatbot.

```javascript
const response = await chatbot.chat(input);
console.log('Chatbot response:', response);
```

### DeepSeek Model Example

```javascript
const deepseekInput = new VLLMInput('You are a helpful assistant.', {
  model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
  maxTokens: 150,
  temperature: 0.6
});

deepseekInput.addUserMessage('Explain quantum computing briefly.');

const response = await chatbot.chat(deepseekInput);
console.log('DeepSeek response:', response);
```

---

## Generating Embeddings with vLLM

IntelliNode makes it simple to generate text embeddings using vLLM-hosted models.

**Step 1:** Import modules.

```javascript
const { RemoteEmbedModel, SupportedEmbedModels } = require('intellinode');
const EmbedInput = require('intellinode').EmbedInput;
```

**Step 2:** Set your vLLM embedding server URL.

```javascript
const embedUrl = 'http://localhost:8001';
const embedModel = new RemoteEmbedModel(null, SupportedEmbedModels.VLLM, { baseUrl: embedUrl });
```

**Step 3:** Create embedding input.

```javascript
const input = new EmbedInput({ texts: ['Hello world', 'vLLM embeddings example'] });
```

**Step 4:** Generate embeddings.

```javascript
const embeddings = await embedModel.getEmbeddings(input);
console.log('Embeddings:', embeddings);
```

---

## Connect Self-Hosted vLLM with RAG using One Key

IntelliNode supports connecting your self-hosted vLLM models with Retrieval-Augmented Generation (RAG) using a unified "One Key." This enables your chatbot to reference your uploaded documents or knowledge bases seamlessly.

### How it works:

- **Upload documents** or knowledge base via IntelliNode Cloud.
- Get a **One Key** that connects your vLLM chatbot directly to your documents.
- Enjoy **personalized responses** powered by your data.

See the [IntelliCloud Docs](https://docs.intellinode.ai/docs/npm/intellicloud) for detailed instructions.

### Example: vLLM + One Key

```javascript
const intelliKey = '<your_one_key>';

const chatbot = new Chatbot(
  null,
  SupportedChatModels.VLLM,
  null,
  {
    baseUrl: 'http://localhost:8000', 
    oneKey: intelliKey
  }
);

const input = new VLLMInput('You are a helpful assistant.', {
  model: 'meta-llama/Llama-3.1-8B-Instruct',
  maxTokens: 200,
  temperature: 0.5
});

input.addUserMessage('Summarize the key points from our uploaded annual report.');

const response = await chatbot.chat(input);
console.log('Personalized response:', response);
```

This integration allows your chatbot to deliver accurate and context-aware responses derived directly from your own data sources.

