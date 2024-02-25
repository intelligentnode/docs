---
sidebar_position: 2
---

# Quick start


This guide helps you integrate intellinode in your Node.js project for basic tasks like chatbots and in-memory semantic search.

### Installation
Install IntelliNode using npm:

```bash
npm install intellinode
```

### Chatbot

Easily integrate and switch between chatbot providers:

```javascript
const { Chatbot, ChatGPTInput, SupportedChatModels } = require('intellinode');

async function callChatbot(provider, apiKey, model = null) {
  // prepare common input
  const input = new ChatGPTInput("You are a helpful assistant.", model);
  input.addUserMessage("What is the capital of France?");
  
  // create chatbot instance
  const chatbot = new Chatbot(apiKey, provider);
  const response = await chatbot.chat(input);

  console.log(response);
}

// call chatGPT
callChatbot(SupportedChatModels.OPENAI, 'your_openai_api_key', 'gpt-4');

// Call mistral
callChatbot(SupportedChatModels.MISTRAL, 'your_mistral_api_key', 'mistral-medium');

// call gemini
callChatbot(SupportedChatModels.GEMINI, 'your_gemini_api_key');
```

Replace `your_<model>_api_key` with your actual API key and explore other supported models.

### Semantic Search

Find relevant items in your data using semantic similarity:

```javascript
const { SemanticSearch } = require('intellinode');

const apiKey = 'your_api_key';
const search = new SemanticSearch(apiKey);

# prepare the input
const pivotItem = 'Example search item';
const searchArray = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
const numberOfMatches = 3;

# performSearch
const results = await search.getTopMatches(pivotItem, searchArray, numberOfMatches);
```


