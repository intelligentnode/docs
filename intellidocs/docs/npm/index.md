---
slug: /npm
title: "Open Source AI Library for Node.js"
sidebar_label: "Introduction"
description: "Open source Node.js AI library with one API for OpenAI, Claude, Gemini, Mistral and local models, plus tool calling, a coding agent and an MCP server."
keywords: ["intellinode node.js","npm intellinode","node.js ai framework","openai claude gemini node.js","mcp server node.js","ai chatbot node.js"]
---

# Introduction

Intellinode is a framework to streamline the interactions with diverse AI capabilities. It provides a unified layer to access multiple models such as speech, image, and text, and higher level building blocks such as a tool-calling chatbot, a coding agent and an MCP server.

```sh
npm i intellinode
```

The package ships TypeScript declarations, a browser bundle (`front/intellinode.min.js`) and the `intellinode` command line (`npx intellinode mcp`).

### Core Components

* **The wrapper layer** provides low-level access to the latest AI models and libraries through plain HTTP calls.
* **The controller layer** offers a unified input to any language, image, embedding or speech model.
* **The function layer** provides abstract application layers with the ability to extend the use cases based on apps' needs.

The wrapper layer in intellinode include:

* **OpenAIWrapper**: Access to the OpenAI models (GPT-5.5 and the Responses API, images, embeddings, speech).
* **AnthropicWrapper**: Access to the Claude models (Sonnet 5, Opus 5, Fable 5.1, Haiku 4.5).
* **GeminiAIWrapper**: Access to the Google Gemini models.
* **MistralAIWrapper**: Access to the Mistral models.
* **CohereAIWrapper**: Access to the Cohere Command models.
* **NvidiaWrapper**: Access to the NVIDIA hosted models (DeepSeek, Llama) and local NIM.
* **OpenAICompatibleWrapper**: One wrapper for every OpenAI-compatible service: OpenRouter, Groq, DeepSeek, xAI, Together, Ollama and LM Studio.
* **VLLMWrapper**: Access to self-hosted vLLM models.
* **StabilityAIWrapper**: Interaction with the stable diffusion image models.
* **HuggingWrapper**: The Hugging Face inference capability with endless open-source models.
* **ReplicateWrapper**: Access to Llama chat models.
* **IntellicloudWrapper**: Connect any AI model with your data using intellinode one key.

The controller layer include:

* **RemoteEmbedModel**: Generate text embeddings using various AI models.
* **RemoteImageModel**: Image generation with a unified access layer.
* **RemoteLanguageModel**: Text generation with a unified access layer.
* **RemoteSpeechModel**: Speech generation capabilities.

Intellinode also provides a set of functions that offer higher-level abstraction:

* **Chatbot**: A unified chatbot for every provider with streaming, a tool-calling loop (`runTools`) and schema-matched JSON output (`chatJson`).
* **Gen**: The fastest way to interact with AI models for your use cases, one line to generate tuned content, UI code, backend code, tests and more.
* **CodingAgent**: An agent that edits a repository and runs its tests until they pass.
* **MCPClient** and **MCPServer**: Use the tools of any MCP server in your chatbot, or serve intellinode's tools to Claude Code, Cursor and VS Code.
* **SemanticSearch**: Speeds the semantic search integration using powerful embedding providers.
* **SemanticSearchPaging**: Apply the semantic search in iterations for large datasets.
* **TextAnalyzer**: Sentiment analysis, text summaries, and more.
* **LLMEvaluation**: Evaluate multiple language models with minimum code and select the suitable one for your use cases.
* **ChatContext**: Manage the chatbot window size limitation by returning the relevant messages for the user input.


### Example

Use the gen function for one line AI integration.
```javascript
const { Gen } = require('intellinode');

// React component source from a description (openai gpt-5.5 is default)
const code = await Gen.generate_component('a pricing card with a plan name, price and a CTA button', openaiKey);

// the same call with Claude
const form = await Gen.generate_form('a contact form with name, email and message', anthropicKey, 'anthropic');
```

Run the tools you define until the model has the answer:
```javascript
const { Chatbot, ChatGPTInput } = require('intellinode');

const tools = [{
  name: 'get_weather',
  description: 'Current weather for a city',
  parameters: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] },
  handler: async ({ city }) => ({ city, tempC: 22 }),
}];

const input = new ChatGPTInput('You are a weather assistant.');
input.addUserMessage('What is the weather in Paris?');

const { text } = await new Chatbot(openaiKey, 'openai').runTools(input, tools);
```

## License
This project is licensed under Apache 2.0.
