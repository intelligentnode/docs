---
sidebar_position: 3
---

# Text analyzer

The `TextAnalyzer` class in IntelliNode provides functionality for summarizing text content and performing sentiment analysis using various AI models. 

### Parameters

#### Summarize Function

- **text**: The text content you want to summarize.
- **apiKey**: Your API key for the chosen AI model provider.
- **provider**: The AI service provider (`SupportedLangModels.OPENAI` or `SupportedLangModels.COHERE`).

#### Sentiment Analysis Function

- **text**: The text content for which you want to analyze sentiment.
- **apiKey**: Your API key for the chosen AI model provider.
- **provider**: The AI service provider (`SupportedLangModels.OPENAI` or `SupportedLangModels.COHERE`).

### Example

**Text Summarization with OpenAI**

```javascript
const { TextAnalyzer } = require('intellinode/function/TextAnalyzer');
const { SupportedLangModels } = require('intellinode/controller/RemoteLanguageModel');

const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiTextAnalyzer = new TextAnalyzer(openaiApiKey, SupportedLangModels.OPENAI);

const text = 'IntelliNode is a javascript library that integrates cutting-edge AI models into your project...';

(async () => {
  const summary = await openaiTextAnalyzer.summarize(text);
  console.log('Summary:', summary);
})();
```

**Sentiment Analysis with Cohere**

```javascript
const { TextAnalyzer } = require('intellinode/function/TextAnalyzer');
const { SupportedLangModels } = require('intellinode/controller/RemoteLanguageModel');

const cohereApiKey = process.env.COHERE_API_KEY;
const cohereTextAnalyzer = new TextAnalyzer(cohereApiKey, SupportedLangModels.COHERE);

const text = 'IntelliNode is an amazing AI library that makes it easy to integrate various AI models...';

(async () => {
  const sentiment = await cohereTextAnalyzer.sentimentAnalysis(text);
  console.log('Sentiment Analysis:', sentiment);
})();
```
