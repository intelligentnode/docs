---
sidebar_position: 7
title: "NVIDIA DeepSeek and Llama Chat in Node.js"
sidebar_label: "DeepSeek & Llama"
description: "Build NVIDIA chatbots with IntelliNode in Node.js using DeepSeek and Llama models, multi-turn messages, and local NVIDIA NIM endpoints."
keywords: ["intellinode nvidia chat","node.js deepseek chatbot","node.js llama chatbot","nvidia nim node.js","nvidia chatbot api","deepseek chat ui"]
---

# DeepSeek & Llama

Intellinode supports NVIDIA’s latest language models, **Deepseek** and **Llama**, via a unified chatbot interface. 
With minimal code changes, you can switch between NVIDIA, OpenAI, and other providers.

## Supported Models

Sample of supported models with much more available using Intellinode Nvidia connector:
| Model Name                  | 
|-----------------------------|
| deepseek-ai/deepseek-v4-flash-0731 |
| meta/llama-3.3-70b-instruct |
| tiiuae/falcon3-7b-instruct |


## Get Started

### API Key
Visit NVIDIA [model catalog](https://build.nvidia.com/models) to get your API key.


### Chat Code

```javascript
const { Chatbot, NvidiaInput, SupportedChatModels } = require("intellinode");
```

Provide your NVIDIA API key and create a chatbot instance:

```javascript
const nvidiaBot = new Chatbot(NVIDIA_API_KEY, SupportedChatModels.NVIDIA);
```

Construct a chat input using the `NvidiaInput` class and add your message(s):

```javascript
const input = new NvidiaInput("You are a helpful assistant.", {
  model: 'deepseek-ai/deepseek-v4-flash-0731', // Use Deepseek or NVIDIA Llama model
  maxTokens: 512,
  temperature: 0.6
});
input.addUserMessage("Which number is larger, 9.11 or 9.8?");
```

Send the chat input:

```javascript
const response = await nvidiaBot.chat(input);
console.log(response); // Returns a plain text response with any <think> tags removed
```

### Multiple Messages

Nvidia Chat supports multi-turn conversations just like other chatbot models:

```javascript
const input = new NvidiaInput("You are an insightful assistant.", {
  model: 'deepseek-ai/deepseek-v4-flash-0731',
  maxTokens: 512,
  temperature: 0.6
});
input.addUserMessage("What's the summary of the Inception movie?");
input.addAssistantMessage("Inception is about a thief who enters dreams to extract or plant ideas.");
input.addUserMessage("How does that compare to Interstellar?");
const responses = await nvidiaBot.chat(input);
responses.forEach(resp => console.log("- " + resp));
```

### Try DeepSeek From the UI

To chat with DeepSeek models without code, open [IntelliChat](https://chat.intellinode.ai/), select the **DeepSeek** provider and paste your DeepSeek key. See [Chat UI](/docs/npm/chatbot/docs-chat) for the setup.

## NVIDIA NIM
Nvidia NIM provide optimized way to host models locally.
Download NVIDIA NIM as instructed in [Nvidia documentation](https://docs.nvidia.com/nim/large-language-models/latest/getting-started.html#option-1-from-api-catalog).

Update your client to point to your local endpoint:
```javascript
const { Chatbot, NvidiaInput, SupportedChatModels } = require("intellinode");

// provide your NVIDIA key and local host url
const nvidiaBot = new Chatbot(NVIDIA_API_KEY, SupportedChatModels.NVIDIA, null, { baseUrl: 'http://0.0.0.0:8000'});

// construct a chat input using the `NvidiaInput`
const input = new NvidiaInput("You are a helpful assistant.", {
  model: 'meta/llama-3.3-70b-instruct'
});
input.addUserMessage("Which number is larger, 9.11 or 9.8?");

// call the chatbot
const response = await nvidiaBot.chat(input);
```

Check available NIM models in NVIDIA's [model catalog](https://build.nvidia.com/models?filters=nimType%3Anim_type_run_anywhere). Open any model and follow the setup instructions under the Docker tab to deploy.

