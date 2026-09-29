---
sidebar_position: 2
title: "Run Mistral Offline in Python"
sidebar_label: "Mistral"
description: "Build an offline Mistral chatbot in Python with Intelli, Keras NLP, and Kaggle models, using the same Chatbot input as the hosted providers."
keywords: ["python mistral chatbot","offline mistral python","intelli python library","keras nlp mistral","kaggle mistral model"]
---

# Mistral
You can use any of the latest released Mistral models offline:
- `mistral_7b_en`.
- `mistral_instruct_7b_en`.
- `mistral_0.2_instruct_7b_en`.

It is recommended to use the **instruct** versions as they adhere more closely to your commands.

## Setup

### Initial Setup

To start, you'll need to download the model from Kaggle. Follow these steps:
1. Create an account on Kaggle.
2. Go to the [model page](https://www.kaggle.com/models/keras/mistral) and approve the license.
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
    "model_name": "mistral_instruct_7b_en",
    "model_params": {
        "KAGGLE_USERNAME": kaggle_user,
        "KAGGLE_KEY": kaggle_key
    }
}
```

Initialize the chatbot:
```python
mistral_bot = Chatbot(provider=ChatProvider.KERAS, options=model_params)
```

Prepare the input instructions:
```python
input = ChatModelInput("You are a helpful assistant.")
input.max_tokens = 100
input.add_user_message("Explain the theory of relativity.")
```

Execute the chatbot:
```python
response = mistral_bot.chat(input)
```
