---
sidebar_position: 4
title: "Run Llama Offline in Python"
sidebar_label: "Llama"
description: "Run Llama 3 models offline with Intelli using Keras NLP and Kaggle credentials, through the same Chatbot input as the hosted providers."
keywords: ["python llama offline chatbot","intelli llama 3","keras nlp llama python","kaggle llama 3 setup"]
---

# Llama
You can use any of the latest released Llama models offline:
- `llama3_8b_en`.
- `llama3_instruct_8b_en`.

It is recommended to use the instruct versions as they adhere more closely to your commands.

## Setup

### Initial Setup

All other models require only Kaggle license approval. However, accessing Llama models involves two steps, requiring approval from Meta before downloading from Kaggle:

1. Request access to Llama models. It is recommended to use a professional or educational email: [Llama Downloads](https://llama.meta.com/llama-downloads/)
2. Create an account on Kaggle with the same email used for Meta access.
3. Go to the [model page](https://www.kaggle.com/models/keras/llama3) and approve the license.
4. Generate your access token by clicking on your profile image, then 'Settings,' and then the 'Create New Token' button.

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
