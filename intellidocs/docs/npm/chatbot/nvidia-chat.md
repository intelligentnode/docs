---
sidebar_position: 3
---

# DeepSeek & Llama

Intellinode supports NVIDIA’s latest language models—**Deepseek** and **Llama**—via a unified chatbot interface. 
With minimal code changes, you can switch between NVIDIA, OpenAI, and other providers.

## Supported Models

Sample of supported models with much more available using Intellinode Nvidia connector:
| Model Name                  | 
|-----------------------------|
| deepseek-ai/deepseek-r1     |
| meta/llama-3.3-70b-instruct |
| tiiuae/falcon3-7b-instruct |
| meta/llama-3.1-8b-instruct |


## Get Started

### API Key
Visit NVIDIA [model catelog](https://build.nvidia.com/models) to get your API key.


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
  model: 'deepseek-ai/deepseek-r1', // Use Deepseek or NVIDIA Llama model
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
  model: 'deepseek-ai/deepseek-r1',
  maxTokens: 512,
  temperature: 0.6
});
input.addUserMessage("What's the summary of the Inception movie?");
input.addAssistantMessage("Inception is about a thief who enters dreams to extract or plant ideas.");
input.addUserMessage("How does that compare to Interstellar?");
const responses = await nvidiaBot.chat(input);
responses.forEach(resp => console.log("- " + resp));
```

### Docs Chat Integration with NVIDIA

Intellinode Cloud allows you to connect your data to various chatbot engines—including NVIDIA Chat—to tailor responses based on your uploaded documents or images.

**How to set up Intellinode Cloud with your data:**
1. Visit the **[IntelliNode App](https://app.intellinode.ai/)**.
2. Start a project using the **Document** option.
3. Upload your documents or images (PDF, DOC, DOCX, PNG, JPG, etc.).
4. Copy the generated **One Key**; this key connects NVIDIA Chat to your data.

#### Example: NVIDIA Chat with One Key
One Key provides a unified approach to connect to your data from any model.

Import the necessary modules and use your One Key:

```javascript
const { Chatbot, NvidiaInput, SupportedChatModels } = require("intellinode");
const intelliKey = '<generated_one_key>';

const nvidiaBot = new Chatbot(NVIDIA_API_KEY, SupportedChatModels.NVIDIA, null, { oneKey: intelliKey });

const input = new NvidiaInput("You are a helpful assistant.", {
  model: 'deepseek-ai/deepseek-r1',
  maxTokens: 512,
  temperature: 0.6
});
input.addUserMessage("List the key features of our new vector database.");
const responses = await nvidiaBot.chat(input);
responses.forEach(response => console.log("- " + response));
```

## NVIDIA NIM
Nvidia NIM provide optimized way to host models locally.
Download NVIDIA NIM as instructed in [Nvidia documentation](https://docs.nvidia.com/nim/large-language-models/latest/getting-started.html#option-1-from-api-catalog).

Update your client to point to your local endpoint:
```javascript
const { Chatbot, NvidiaInput, SupportedChatModels } = require("intellinode");

// provide your NVIDIA key and local host url
const nvidiaBot = new Chatbot(NVIDIA_API_KEY, SupportedChatModels.NVIDIA, null, {
  nvidiaOptions: { baseUrl: 'http://0.0.0.0:8000' }
});

// construct a chat input using the `NvidiaInput`
const input = new NvidiaInput("You are a helpful assistant.", {
  model: 'meta/llama-3.1-8b-instruct1'
});
input.addUserMessage("Which number is larger, 9.11 or 9.8?");

// call the chatbot
const response = await nvidiaBot.chat(input);
```
