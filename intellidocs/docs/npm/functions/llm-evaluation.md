---
sidebar_position: 4
---

# LLM evaluation

The Language Model Evaluation feature is used to compare different Language Learning Models (LLMs) such as ChatGPT, LLaMA, Cohere, etc. The evaluation is performed by comparing the cosine similarity and Euclidean distance scores of predicted responses against an array of target answers.

### Usage
Here is an example to demonstrate the usage of LLM Evaluation. In this case, we are comparing **OpenAI's ChatGPT** language model with **Cohere's command** completion model:

**Step 1: Imports** <br/>
The first thing is to import the required modules from the IntelliNode library. The main module that we need for this is `LLMEvaluation`, along with `SupportedChatModels` and `SupportedLangModels`.

```javascript
const { LLMEvaluation, SupportedChatModels, SupportedLangModels } = require('intellinode');
```

**Step 2: Create Providers Set** <br/>
Create a list of the chat or language models you want to evaluate with each provider’s API key, the provider name, the model name, and the maximum tokens that the model is allowed to generate in a single call.

```javascript
const openaiChat = { 
    apiKey: openaiKey, 
    provider: SupportedChatModels.OPENAI, 
    type: 'chat', 
    model: 'gpt-3.5-turbo', 
    maxTokens: 100
};

const cohereCompletion = { 
    apiKey: cohereKey, 
    provider: SupportedLangModels.COHERE, 
    type: 'completion', 
    model: 'command', 
    maxTokens: 100 
};

const llamaChat = {
    apiKey: replicateKey, 
    provider: SupportedChatModels.REPLICATE,
    type:'chat', 
    model: '13b-chat', 
    maxTokens: 100
}


const geminiChat = {
  apiKey: geminiKey, 
  provider: SupportedChatModels.GEMINI,
  type: 'chat', 
  model: 'gemini'
};

// the models set to compare
const providerSets = [openaiChat, cohereCompletion, llamaChat, geminiChat];
```

**Step 3: Call LLMEvaluation** <br/>
Create an instance of LLMEvaluation and provide it with the models set:
```javascript
// create the LLMEvaluation with the desired embedding algorithm for unified comparison.
const llmEvaluation = new LLMEvaluation(openaiKey, 'openai');

// the model input
const inputString = "Explain the process of photosynthesis in simple terms.";

// target answers to calculate the average distance
const targetAnswers = [
    "Photosynthesis is the process where green plants use sunlight to...",
    "Photosynthesis is how plants make their own food. They take in water..."
];

// execute the evaluation
const results = await llmEvaluation.compareModels(inputString, targetAnswers, providerSets);
```

The function will return an object that contains the prediction from each model, along with its cosine similarity score and euclidean distance score compared to the target answers. 
```
{
  'openai/gpt-3.5-turbo': [
    {
      prediction: 'Photosynthesis is how plants make food for themselves....',
      score_cosine_similarity: 0.9566836802012463,
      score_euclidean_distance: 0.29175853870023755
    }
  ],
  'replicate/13b-chat': [
      prediction: "Here's an explanation of photosynthesis in simple terms .....",
      score_cosine_similarity: 0.9096764395396765,
      score_euclidean_distance: 0.4248874961328429
  ],
  ...
  lookup: {
    cosine_similarity: 'a value closer to 1 indicates a higher degree of similarity between two vectors',
    euclidean_distance: 'the lower the value, the closer the two points'
  }
}
```
