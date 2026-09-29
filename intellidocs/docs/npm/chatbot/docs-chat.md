---
sidebar_position: 9
title: "Chat UI for Any Model With Your Own Keys"
sidebar_label: "Chat UI"
description: "IntelliChat is an open source chat UI built on IntelliNode. Pick a provider and a model, paste your own key, and chat with OpenAI, Claude, Gemini or local models."
keywords: ["intellinode chat ui","intellichat","open source chatbot ui","chat with your own api key","node.js chatbot ui","local llm chat ui"]
---

# Chat UI

The One Key document service is no longer available, see [Intellicloud](/docs/npm/intellicloud). As a UI alternative, **[IntelliChat](https://chat.intellinode.ai/)** lets you connect any supported model with your own key, and chat with it from the browser without writing code. It is open source and built on the same `Chatbot` you use in code.

### Connect a Model

1. Open **[chat.intellinode.ai](https://chat.intellinode.ai/)** and open the settings.
2. Choose the **Chat**, **Images**, **Voice** or **Code** tab.
3. Select the provider and the model.
4. Paste your API key and save.

Each tab keeps its own key, so you can chat with one provider and generate images or voice with another.

### Supported Providers

| Group | Providers |
| ----- | --------- |
| Cloud | OpenAI, Anthropic, Google Gemini, Cohere, Mistral, Replicate (Llama), Azure OpenAI |
| OpenAI-compatible | OpenRouter, Groq, DeepSeek |
| Local and self-hosted | Ollama, LM Studio, vLLM |

### Features

- Stream replies and stop them at any time.
- Generate images with the image button or `/image`.
- Attach an image and ask about it.
- Dictate messages with the microphone and listen to the replies.
- Paste a GitHub link to ask about a repo, file, issue or pull request.
- Connect a GitHub repo, or a local folder when running locally, and the assistant reads the code and shows each step.

### Run It Locally

Run IntelliChat on your machine to use local models such as Ollama, LM Studio or a vLLM server, or to load your keys from a `.env` file:

```bash
git clone https://github.com/intelligentnode/IntelliChat.git
cd IntelliChat/intellichat
npm install
npm run dev
```

Open `http://localhost:3000`. Optionally copy `.env.example` to `.env` and add your keys, or add them from the settings.

### The Same Chat in Code

The UI settings map to the `Chatbot` arguments, so you can move from the UI to your app with the same provider and model:

```javascript
const { Chatbot, ChatGPTInput } = require("intellinode");

const bot = new Chatbot(openaiKey, "openai");

const input = new ChatGPTInput("You are a helpful assistant.", { model: "gpt-5.5" });
input.addUserMessage("List the included features in the vector database contract.");

const responses = await bot.chat(input);
responses.forEach(response => console.log("- " + response));
```

See [Get started](/docs/npm/chatbot/get-started) for every provider, and [OpenAI-compatible](/docs/npm/chatbot/openai-compatible) for OpenRouter, Groq, DeepSeek and local servers.
