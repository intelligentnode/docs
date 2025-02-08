---
title: Frontend JS
---

# Frontend Javascript

This guide shows how to integrate IntelliNode on your browser. You can load **intellinode.min.js** via CDN and quickly call AI models such as **OpenAI** or **Cohere** from the browser.

## 1. Include Intellinode via CDN

Add a `<script>` tag in your HTML:
```HTML
<script src="https://cdn.jsdelivr.net/npm/intellinode@latest/front/intellinode.min.js"></script>
```

*Alternative mirror link:*
```HTML
<script src="https://unpkg.com/intellinode@2.2.1/front/intellinode.min.js"></script>
```

## 2. Call the Chatbot

### OpenAI Code

```Javascript
async function callOpenAI(apiKey, userPrompt) {
  try {
    // Create a chatbot for "openai"
    const chatbot = new IntelliNode.Chatbot(apiKey, "openai");

    // Prepare ChatGPT input (avoid maxTokens if using O-series models)
    const input = new IntelliNode.ChatGPTInput("You are a helpful assistant.", {
      model: "gpt-4o",
      temperature: 0.7
    });
    input.addUserMessage(userPrompt);

    // Get response
    const responses = await chatbot.chat(input);
    return responses[0] || "(No response)";
  } catch (err) {
    return "OpenAI Error: " + err.message;
  }
}
```

Use example
```
const apiKey = "<YOUR_OPENAI_KEY>";
const openaiResult = await callOpenAI(apiKey, "Explain AI in simple terms.");
console.log("OpenAI says:", openaiResult);
```

### Cohere Code

```Javascript
async function callCohere(apiKey, userPrompt) {
  try {
    // Create a chatbot for "cohere"
    const chatbot = new IntelliNode.Chatbot(apiKey, "cohere");

    // Prepare Cohere input
    const input = new IntelliNode.CohereInput("You are a helpful assistant.", {
      model: "command-r"
    });
    input.addUserMessage(userPrompt);

    // Get response
    const responses = await chatbot.chat(input);
    return responses[0] || "(No response)";
  } catch (err) {
    return "Cohere Error: " + err.message;
  }
}
```

Use example
```
const cohereKey = "<YOUR_COHERE_KEY>";
const cohereResult = await callCohere(cohereKey, "What are the latest trends in AI?");
console.log("Cohere says:", cohereResult);
```

## HTML Sample
For html example, check out: 
📂 [GitHub Samples Repository](https://github.com/intelligentnode/IntelliNode/tree/main/samples/frontend)

## Notes
1. Avoid embedding raw API keys directly in your front-end code, and let the user enter their keys.
2. This browser-based approach has been tested with OpenAI and Cohere models.
3. Some models, such as Anthropic, do not support client-side connections.
