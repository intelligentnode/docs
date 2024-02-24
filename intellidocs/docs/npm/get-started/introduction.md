---
sidebar_position: 1
---

# Introduction

Intellinode is a framework to streamline the interactions with diverse AI capabilities. It provides a unified layer to access multiple models such as speech, image, and text.

### Core Components

* **The wrapper layer** provides low-level access to the latest AI models and libraries.
* **The controller layer** offers a unified input to any language, image, or speech model.
* **The function layer** provides abstract application layers with the ability to extend the use cases based on apps’ needs.

The wrapper layer in intellinode include:

* **CohereAIWrapper**: Provides access to the Cohere AI model.
* **GoogleAIWrapper**: Enables interaction with the Google AI model.
* **HuggingWrapper**: Provides the Hugging Face inference capability with endless open-source models.
* **OpenAIWrapper**: Offers access to the OpenAI GPT models.
* **StabilityAIWrapper**: Enables interaction with the stable diffusion image model.
* **ReplicateWrapper**: Provides access to Llama v2 chat models.
* **MistralAIWrapper**: Provides access to Mistral SMoE model.
* **IntellicloudWrapper**: Connect any AI model with your data using intellinode one key.

The controller layer include:

* **RemoteEmbedModel**: Provides the ability to generate text embeddings using various AI models.
* **RemoteImageModel**: Enables image generation with a unified access layer.
* **RemoteLanguageModel**: Allows generation of text with a unified access layer.
* **RemoteSpeechModel**: Provides speech generation capabilities.

Intellinode also provides a set of functions that offer higher-level abstraction:

* **Gen**: The fastest way to interact with AI models for your use cases, one line to generate tuned content.
* **Chatbot**: A function that integrates chatbot capabilities using chatGPT and Llama models.
* **SemanticSearch**: A function that speeds the semantic search integration using powerful embedding providers.
* **SemanticSearchPaging**: Apply the semantic search in iterations for large datasets.
* **TextAnalyzer**: Sentiment analysis, text summaries, and more.
* **LLMEvaluation**: Evaluate multiple language models with minimum code and select the suitable one for your use cases.
* **ChatContext**: Manage the chatbot window size limitation by returning the relevant messages for the user input.


### Example

Use the gen function for one line AI integration.
```python
const { Gen } = require('intellinode');

text = 'a registration page with flat modern theme.'
// one line to generate html page code (openai gpt4 is default)
await Gen.save_html_page(text, save_folder_name, file_name, openaiKey);
```

## License
This project is licensed under Apache 2.0.
  
