---
sidebar_position: 1
title: "Run Gemma Offline in Python"
sidebar_label: "Gemma"
description: "Use Intelli in Python to run Gemma 2 models offline with Keras NLP, a one time Kaggle setup and the unified Chatbot input."
keywords: ["intelli python gemma","offline gemma chatbot","gemma 2 keras nlp","python offline chatbot","kaggle gemma setup","intellinode chatbot"]
---

# Gemma
You can use any of the latest Gemma models offline:
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
