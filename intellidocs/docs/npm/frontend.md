---
title: Frontend JS
---

# Frontend Javascript

This guide shows how to integrate IntelliNode on your browser. You can load **intellinode.min.js** via CDN and quickly call AI models such as **OpenAI**, **Cohere**, **Mistral**, **Gemini**, **Nvidia**, and **Stability AI** directly from the browser without backend infrastructure.

**Key Features:**
- 🤖 **Multi-Provider Support**: Unified API for multiple AI providers.
- 💬 **Chat Models**: GPT-5, Command-A, Mistral, and more.
- 🎨 **Image Generation & Transformation**: Stability AI integration with style controls.
- 🔄 **Streaming Support**: Real-time response streaming for chat models.
- 📦 **Zero Dependencies**: Self-contained browser library.

## 1. Include Intellinode via CDN

Add a `<script>` tag in your HTML:
```HTML
<script src="https://cdn.jsdelivr.net/npm/intellinode@latest/front/intellinode.min.js"></script>
```

*Alternative mirror link:*
```HTML
<script src="https://unpkg.com/intellinode@2.2.1/front/intellinode.min.js"></script>
```

Once loaded, all IntelliNode classes are available under the global `IntelliNode` namespace.

## 2. Call the Chatbot

The `Chatbot` class provides a unified interface for interacting with multiple AI chat models. It supports conversation history, streaming responses, and model-specific configurations.

### OpenAI Code

OpenAI models including GPT-5, GPT-4o, and o3-mini are supported.

```Javascript
async function callOpenAI(apiKey, userPrompt) {
  try {
    // Create a chatbot for "openai"
    const chatbot = new IntelliNode.Chatbot(apiKey, "openai");

    // Prepare ChatGPT input with optional parameters
    const input = new IntelliNode.ChatGPTInput("You are a helpful assistant.", {
      model: "gpt-5",
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

**Usage Example:**
```Javascript
const apiKey = "<YOUR_OPENAI_KEY>";
const openaiResult = await callOpenAI(apiKey, "Explain AI in simple terms.");
console.log("OpenAI says:", openaiResult);
```

**Multi-turn Conversation:**
```Javascript
const input = new IntelliNode.ChatGPTInput("You are a helpful assistant.", {
  model: "gpt-4o"
});
input.addUserMessage("What is the capital of France?");
input.addAssistantMessage("The capital of France is Paris.");
input.addUserMessage("What's the population?");
// Continue the conversation with context
```

### Cohere Code

Cohere provides powerful language models optimized for conversation and command execution.

```Javascript
async function callCohere(apiKey, userPrompt) {
  try {
    // Create a chatbot for "cohere"
    const chatbot = new IntelliNode.Chatbot(apiKey, "cohere");

    // Prepare Cohere input with optional parameters
    const input = new IntelliNode.CohereInput("You are a helpful assistant.", {
      model: "command-a-03-2025",  // Supported: command-a-03-2025, command-r7b-12-2024
      temperature: 0.7,             // Control creativity
      max_tokens: 1000              // Maximum response length
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

**Usage Example:**
```Javascript
const cohereKey = "<YOUR_COHERE_KEY>";
const cohereResult = await callCohere(cohereKey, "What are the latest trends in AI?");
console.log("Cohere says:", cohereResult);
```

### Mistral Code

Mistral AI offers efficient and powerful open-source models.

```Javascript
async function callMistral(apiKey, userPrompt) {
  try {
    const chatbot = new IntelliNode.Chatbot(apiKey, "mistral");
    
    const input = new IntelliNode.MistralInput("You are a helpful assistant.", {
      model: "mistral-large",       // Supported: mistral-tiny, mistral-medium, mistral-large
      temperature: 0.7,
      max_tokens: 1000
    });
    input.addUserMessage(userPrompt);
    
    const responses = await chatbot.chat(input);
    return responses[0] || "(No response)";
  } catch (err) {
    return "Mistral Error: " + err.message;
  }
}
```

### Nvidia Code

Access cutting-edge models through Nvidia's inference platform.

```Javascript
async function callNvidia(apiKey, userPrompt) {
  try {
    const chatbot = new IntelliNode.Chatbot(apiKey, "nvidia");
    
    const input = new IntelliNode.NvidiaInput("You are a helpful assistant.", {
      model: "meta/llama-3.3-70b-instruct",  // or deepseek-ai/deepseek-r1
      temperature: 0.7,
      max_tokens: 1024
    });
    input.addUserMessage(userPrompt);
    
    const responses = await chatbot.chat(input);
    return responses[0] || "(No response)";
  } catch (err) {
    return "Nvidia Error: " + err.message;
  }
}
```

### Gemini Code

Google's Gemini models for advanced AI capabilities.

```Javascript
async function callGemini(apiKey, userPrompt) {
  try {
    const chatbot = new IntelliNode.Chatbot(apiKey, "gemini");
    
    const input = new IntelliNode.GeminiInput("You are a helpful assistant.", {
      model: "gemini-pro",
      temperature: 0.7
    });
    input.addUserMessage(userPrompt);
    
    const responses = await chatbot.chat(input);
    return responses[0] || "(No response)";
  } catch (err) {
    return "Gemini Error: " + err.message;
  }
}
```

## 3. Image Generation & Transformation

Stability AI provides powerful image generation and transformation capabilities with three control methods: **Style**, **Sketch**, and **Structure**.

### Control Style

Transform images with artistic styles while maintaining the original content. Optional parameters include `negative_prompt`, `fidelity` (0-1, how close to original), `aspect_ratio`, and `seed`.

```Javascript
async function applyStyle(stabilityKey, imageFile, stylePrompt) {
  try {
    const stability = new IntelliNode.StabilityAIWrapper(stabilityKey);

    // Call the controlStyle function with the image file and style prompt
    const rawResult = await stability.controlStyle({
      imagePath: imageFile,
      prompt: stylePrompt,
      output_format: 'png',
      accept: 'image/*'
    });

    // Convert the binary result into an image URL
    const blob = new Blob([rawResult], { type: 'image/png' });
    return URL.createObjectURL(blob);
  } catch (err) {
    return 'Stability Error: ' + err.message;
  }
}
```

**Usage Example:**
```Javascript
const stabilityKey = "<YOUR_STABILITY_KEY>";
const imageFile = document.getElementById('imageInput').files[0];
const stylePrompt = "Vintage oil painting style with warm colors";
const styledImageUrl = await applyStyle(stabilityKey, imageFile, stylePrompt);
document.getElementById('styledImage').src = styledImageUrl;
```

### Control Sketch

Convert images to sketches and apply new artistic styles. Optional parameters include `control_strength` (0-1, how much to follow the sketch), `negative_prompt`, `seed`, and `style_preset`.

```Javascript
async function applySketch(stabilityKey, imageFile, prompt) {
  try {
    const stability = new IntelliNode.StabilityAIWrapper(stabilityKey);

    const rawResult = await stability.controlSketch({
      imagePath: imageFile,
      prompt: prompt,
      output_format: 'png',
      accept: 'image/*'
    });

    const blob = new Blob([rawResult], { type: 'image/png' });
    return URL.createObjectURL(blob);
  } catch (err) {
    return 'Sketch Error: ' + err.message;
  }
}
```

### Control Structure

Maintain the structure while changing the appearance completely.

```Javascript
async function applyStructure(stabilityKey, imageFile, prompt) {
  try {
    const stability = new IntelliNode.StabilityAIWrapper(stabilityKey);

    const rawResult = await stability.controlStructure({
      imagePath: imageFile,
      prompt: prompt,
      control_strength: 0.7,         // Structural adherence (0-1)
      output_format: 'png',
      accept: 'image/*'
    });

    const blob = new Blob([rawResult], { type: 'image/png' });
    return URL.createObjectURL(blob);
  } catch (err) {
    return 'Structure Error: ' + err.message;
  }
}
```

**Image Requirements:**
- Minimum dimensions: 64x64 pixels.
- Supported formats: JPEG, PNG, WebP.

## HTML Samples

IntelliNode provides ready-to-use frontend samples:

1. **Chat Playground** (`index.html`): Multi-provider chat interface.
2. **Stability Control Studio** (`style_studio.html`): Image transformation with Style, Sketch, and Structure control methods.
3. **HTML Generator** (`html_generator.html`): AI-powered website generator using LLMs with live preview and download.

📂 [Open GitHub Samples](https://github.com/intelligentnode/IntelliNode/tree/main/samples/frontend)

## Notes
1. Avoid embedding raw API keys directly in your front-end code, and let the user enter their keys.
2. This browser-based approach has been tested with OpenAI and Cohere models.
3. Some models, such as Anthropic, do not support client-side connections.
