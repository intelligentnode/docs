---
sidebar_position: 2
---
# Embedding


The Embedding controller convert the text into high-dimensional vector representation. The vector capture the meaning of words, or sentences, enabling various NLP tasks like:

- Semantic search: Find relevant results based on meaning, not just keywords.
- Text clustering: Group similar texts automatically.
- Similarity comparison: Measure how similar two pieces of text are.

### Supported Providers
Choose from different AI providers for embedding generation: openai, mistral, gemini.


### Parameters

You need to specify several parameters to tailor the embedding generation to your requirements:

- **provider_name**: The name of the AI service provider (`openai`, `mistral`, or `gemini`).
- **api_key**: Your API key or authentication token for the chosen provider.
- **texts**: A list of texts for which you want to generate embeddings. Each item in the list can be a word, sentence, or paragraph.
- **model** (optional): The specific model you wish to use for embedding generation.

### Example

Initialize the Embedding controller with your chosen provider and API key:

```python
from intelli.controller.remote_embed_model import RemoteEmbedModel
embed_model = RemoteEmbedModel(provider_name="openai", api_key="your_openai_api_key_here")
```

Generate embeddings for your texts by creating an `EmbedInput` instance and passing it to the controller's `get_embeddings` method:

```python
from intelli.model.input.embed_input import EmbedInput

# define the texts to generate embeddings
texts = ["This is a test sentence for embeddings.", "Exploring the capabilities of AI models."]

# create an EmbedInput instance
embed_input = EmbedInput(texts)

# generate embeddings
embeddings = embed_model.get_embeddings(embed_input)
```
