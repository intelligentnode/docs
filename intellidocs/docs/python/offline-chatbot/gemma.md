---
sidebar_position: 1
---

# Gemma
You can use any of the latest released Gemma models offline:
- `gemma2_9b_en`.
- `gemma2_27b_en`.
- `gemma2_instruct_9b_en`.
- `gemma2_instruct_27b_en`.

It is recommended to use the instruct versions as they adhere more closely to your commands.

## Setup

### Initial Setup

To start, you'll need to download the model from Kaggle. Follow these steps:
1. Create an account on Kaggle.
2. Go to the [model page](https://www.kaggle.com/models/keras/gemma2) and approve the license.
3. Generate your access token by clicking on your profile image, then 'Settings', and then the 'Create New Token' button.

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
    "model_name": "gemma2_instruct_9b_en",
    "model_params": {
        "KAGGLE_USERNAME": kaggle_user,
        "KAGGLE_KEY": kaggle_key
    }
}
```

Initialize the chatbot:
```python
gemma_bot = Chatbot(provider=ChatProvider.KERAS, options=model_params)
```

Prepare the input instructions:
```python
input = ChatModelInput("You are a helpful assistant.")
input.max_tokens = 100
input.add_user_message("Explain the theory of relativity.")
```

Execute the chatbot:
```python
response = gemma_bot.chat(input)
```

## Retrieval-Augmented Generation (RAG)

Intellinode allows you to upload your documents for free and generate a key to provide RAG capabilities to any open-source chatbot, enhancing the model's ability to answer questions using your data.

### Setting Up RAG
1. Go to [Intellinode cloud](https://app.intellinode.ai/).
2. Start a new project with the default settings.
3. Upload any PDF (preferred), JSON, word, image, code, or CSV file.
4. After the document is uploaded successfully, copy the provided one key for RAG integration.

### Updating the Chatbot with RAG

Update the chatbot with the RAG key:
```python
gemma_bot.add_rag({'one_key': '<your-rag-key>'})
```

Prepare the input instructions:

```python
input = ChatModelInput("Answer only from the context.")
input.max_tokens = 2000
input.search_k = 2 # number of returned pages
input.add_user_message("What is the red planet?")
```

Execute
```python
response = gemma_bot.chat(input)
```

### RAG Notes
1. Increase the number of max tokens when increasing the number of searched pages (search_k). The model generates both the input and output with each iteration, If the input contains too many pages and the max tokens is too low, the model may only regenerate the input without leaving space for the output.

2. Increasing the max tokens can impact the model's response time and require higher computational resources.

3. Increasing the number of returned pages (search_k) improves the accuracy, but requires an increase in the max tokens.

4. Use instructions like `ChatModelInput("Answer only from the context.")` to guide the model to strict responses based on the provided documents.
