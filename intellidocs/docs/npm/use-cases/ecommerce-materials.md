---
sidebar_position: 1
---

# Ecommerce materials


This code sample demonstrates how to create e-commerce materials (product description, images, and audio) using IntelliNode and different AI models like OpenAI, Google, Stability, and Cohere. You can use the following code functions:

<br/>

```javascript
const IntelliNode = require('intellinode');
```

<br/>

### 1. Generate product description
The `generateProductDescription()` function utilizes the `RemoteLanguageModel` class, which fetches the product description from an AI model like OpenAI or Cohere. Provide the appropriate `apiKey`, `modelBackend`, and `modelName`.

```javascript
async function generateProductDescription(textInput, apiKey, modelBackend) {
  // available models: OPENAI or COHERE
  const modelName = (modelBackend === IntelliNode.SupportedLangModels.OPENAI) ? 'text-davinci-003' : 'command';
  const langModel = new IntelliNode.RemoteLanguageModel(apiKey, modelBackend);
  const results = await langModel.generateText(new IntelliNode.LanguageModelInput({
    prompt: textInput,
    model: modelName,
    maxTokens: 300
  }));
  return results[0].trim();
}
```

### 2. Generate image description
The `getImageDescription()` function uses the `Chatbot` class to generate tuned image description from user message. The users might not enter a text suitable for image generation models and this layer will ensure the image prompt quality.

```javascript
async function getImageDescription(textInput, openaiKey) {
  const chatbot = new IntelliNode.Chatbot(openaiKey);
  const input = new IntelliNode.ChatGPTInput('generate image description from paragraph to use it as prompt to generate image from DALL·E or stable diffusion image model. return only the image description to use it as direct input');
  input.addUserMessage(textInput);
  const responses = await chatbot.chat(input);
  return responses[0].trim();
}
```

### 3. Generate images 
The `generateImage()` function uses the `RemoteImageModel` class, which generates images from the description text. The generated images use stable diffusion or DALL·E models.

```javascript
async function generateImage(imageText, apiKey, modelBackend) {
  // available models: OPENAI or STABILITY
  modelBackend = IntelliNode.SupportedImageModels.STABILITY
  const imgModel = new IntelliNode.RemoteImageModel(apiKey, modelBackend);
  const imageInput = new IntelliNode.ImageModelInput({
    prompt: imageText,
    numberOfImages: 3,
    width: 512,
    height: 512
  });
  return await imgModel.generateImages(imageInput);
}
```
### 4. Generate speech 
The `generateSpeech()` uses the `RemoteSpeechModel` and `AudioHelper` classes, which generate and save audio content based on the text input.

```javascript
async function generateSpeech(textInput, apiKey, modelBackend) {
  // modelBackend = IntelliNode.SupportedSpeechModels.GOOGLE
  const speechModel = new IntelliNode.RemoteSpeechModel(apiKey);
  const input = new IntelliNode.Text2SpeechInput({ text: textInput, language: 'en-gb' });
  const audioContent = await speechModel.generateSpeech(input);
  return IntelliNode.AudioHelper.decode(audioContent);
}
```
