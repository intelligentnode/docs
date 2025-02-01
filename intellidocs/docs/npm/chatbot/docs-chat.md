---
sidebar_position: 4
---

# Chat with docs

Intellinode cloud allows you to connect your data to various chatbot engines, including OpenAI ChatGPT, Google Gemini, and LLama V2. This integration enables a tailored chatbot agent experience, providing tuned responses to the context of your uploaded documents or diagram images. 

**How setupt intellinode cloud with your data**
1. Visit the **[IntelliNode App](https://app.intellinode.ai/)**.
2. Start a project using the **Document** option.
3. Upload your documents or images, such as PDF, DOC, DOCX, PNG, JPG, and code files.
4. Copy the generated **One Key**; this key will be used to connect IntelliNode's chatbot to your uploaded data.

### Implementation of Chatbot Models
The setup code is identical for all bots, making it easy to switch between them. You can employ your **One Key** with different language models as shown in the examples below:

First, import the necessary modules:

```javascript
const { Chatbot, SupportedChatModels } = require("intellinode");
const intelliKey = '<generated_one_key>';
```

Assuming that your data set includes software contracts, you can ask the chatbots details about the contract using this code:

```javascript
let query = "List to me the included features in the vector database contract";
```

#### OpenAI ChatGPT

Incorporate the **One Key** with chatGPT in the following way:

```javascript
const openaiBot = new Chatbot(openaiKey, SupportedChatModels.OPENAI, null, {oneKey: intelliKey});
```

You can ask the ChatGPT bot details about the data using this code:

```javascript 
const { ChatGPTInput } = require("intellinode");

const input = new ChatGPTInput();
input.addUserMessage(query);

const responses = await openaiBot.chat(input);
responses.forEach(response => console.log("- " + response));
```

#### Google Gemini

To configure **Google Gemini**, use the **One Key** in this way:

```javascript
const geminiBot = new Chatbot(geminiApiKey, SupportedChatModels.GEMINI, null, {oneKey: intelliKey});
```

You can interact with the Gemini bot using this code:

```javascript
const { GeminiInput } = require("intellinode");

const input = new GeminiInput();
input.addUserMessage(query);

const responses = await geminiBot.chat(input);
responses.forEach(response => console.log("- " + response));
```


#### Mistral AI

To configure the **Mistral** open source model with your data, use the **One Key**:

```javascript
const mistralBot = new Chatbot(mistralApiKey, SupportedChatModels.MISTRAL, null, {oneKey: intelliKey});
```

You can interact with the Mistral bot using this code:

```javascript
const { MistralInput } = require("intellinode");

const input = new MistralInput();
input.addUserMessage(query);

const responses = await mistralBot.chat(input);
responses.forEach(response => console.log("- " + response));
```


#### LLama V2 - Replicate

To implement **LLama V2 - Replicate Bot** with the **One Key**, use:

```javascript
const replicateBot = new Chatbot(replicateApiKey, SupportedChatModels.REPLICATE, null, {oneKey: intelliKey});
```

Interact with the LLama V2 bot with the following code:

```javascript
const { LLamaReplicateInput } = require("intellinode");

const input = new LLamaReplicateInput("You are a helpful assistant!");
input.addUserMessage(query);

const responses = await replicateBot.chat(input);
responses.forEach(response => console.log("- " + response));
```

### Advanced Options
Improve your chatbot responses with additional customization through optional parameters:
- `searchK`: specifies the number of references for the semantic search step.
- `attachReference`: includes the names of reference documents with the chatbot's responses.

**Example Incorporating Advanced Options with OpenAI ChatGPT**

Here's how to utilize these advanced options in an OpenAI ChatGPT integration:

```javascript

// initiate the chatbot
const openaiBot = new Chatbot(openaiKey, SupportedChatModels.OPENAI, null, {oneKey: intelliKey});

// setup the input with the advanced options
const input = new ChatGPTInput("you are helpful assistant", { searchK: 4, attachReference: true });
input.addUserMessage(query);

// when sending attachReference you should use result to get the content
const responses = await openaiBot.chat(input);
responses.result.forEach(response => console.log("- " + response));

// get the referenced documents
console.log('### the chatbot references ###')
console.log(Object.keys(responses.references))

```


**Example Incorporating Advanced Options with Gemini**

Here's how to utilize these advanced options in an OpenAI ChatGPT integration:

```javascript

// initiate the chatbot
const geminiBot = new Chatbot(openaiKey, SupportedChatModels.GEMINI, null, {oneKey: intelliKey});

// setup the input with the advanced options
let query = "List to me the included features in the vector database contract";
const input = new GeminiInput("you are helpful assistant", { searchK: 4, attachReference: true });
input.addUserMessage(query);

// when sending attachReference you should use result to get the content
const responses = await geminiBot.chat(input);
responses.result.forEach(response => console.log("- " + response));

// get the referenced documents
console.log('### the chatbot references ###')
console.log(Object.keys(responses.references))

```

This example demonstrates how to activate document references (`attachReference: true`) and set the number of references (`searchK: 5`). This approach can be adapted to any supported chatbot model, enhancing the contextual understanding.
