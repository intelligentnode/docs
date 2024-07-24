---
sidebar_position: 4
---

# Llama
You can use any of the latest released Mistral models offline:
- `llama3_8b_en`.
- `llama3_instruct_8b_en`.

It is recommended to use the instruct versions as they adhere more closely to your commands.

## Setup

### Initial Setup

All other models require only Kaggle license approval. However, accessing Llama models involves two steps, requiring approval from Meta before downloading from Kaggle:

1. Request access to Llama models. It is recommended to use a professional or educational email: [Llama Downloads](https://llama.meta.com/llama-downloads/)
2. Create an account on Kaggle with the same email used for Meta access.
3. Go to the [model page](https://www.kaggle.com/models/keras/llama3) and approve the license.
4. Generate your username and password by clicking on your profile image, then 'Settings,' and then the 'Create New Token' button.

These credentials will be used once to download the model. After that, all subsequent steps will run offline.

### Installing Dependencies
```python
!pip install keras-nlp
!pip install --upgrade keras>=3
!pip install --upgrade intelli
```

### Importing the Chatbot
Import the unified offline chatbot from Intellinode:
```python
from intelli.function.chatbot import Chatbot, ChatProvider
from intelli.model.input.chatbot_input import ChatModelInput
```

## Using the Chatbot

Set up the model parameters:
```python
model_params = {
    "model_name": "llama3_instruct_8b_en",
    "model_params": {
        "KAGGLE_USERNAME": kaggle_user,
        "KAGGLE_KEY": kaggle_key
    }
}
```

Initialize the chatbot:
```python
llama_bot = Chatbot(provider=ChatProvider.KERAS, options=model_params)
```

Prepare the input instructions:
```python
input = ChatModelInput("You are a helpful assistant.")
input.max_tokens = 100
input.add_user_message("Explain the theory of relativity.")
```

Execute the chatbot:
```python
response = llama_bot.chat(input)
```

## Retrieval-Augmented Generation (RAG)

Intellinode allows you to upload your documents for free and generate a key to provide RAG capabilities to any open-source chatbot, enhancing the model's ability to answer questions using your data.

### Setting Up RAG
1. Go to [Intellinode cloud](https://app.intellinode.ai/).
2. Start a new project with the default settings.
3. Upload any PDF (preferred), JSON, Word, image, code, or CSV file.
4. After the document is uploaded successfully, copy the provided one key for RAG integration.

### Updating the Chatbot with RAG

Update the chatbot with the RAG key:
```python
llama_bot.add_rag({'one_key': '<your-rag-key>'})
```

Prepare the input instructions:

```python
input = ChatModelInput("Answer only from the context.")
input.max_tokens = 1500
input.search_k = 1 # number of returned pages
input.add_user_message("What is the red planet?")
```

Execute
```python
response = llama_bot.chat(input)
```

### RAG Notes
1. Increase the number of max tokens when increasing the number of search tokens. The model generates both the input and output with each iteration. If the input contains too many pages and the max tokens is too low, the model may only regenerate the input without leaving space for the output.

2. Increasing the max tokens can impact the model's response time and may require higher computational resources.

3. Increasing the number of pages can improve the accuracy but requires to increase the max tokens.

4. Use instructions like `ChatModelInput("Answer only from the context.")` to guide the model to strict responses based on the provided documents.