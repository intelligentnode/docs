---
slug: /python
title: Introduction
---


# Introduction

Intelli is a Python framework to streamline the interactions with diverse AI capabilities. It provides a unified layer to access multiple models and orchestrator to connect the input and output of multiple models such as speech, image, and text.

### Core Components

1. **Wrapper Layer**: Direct access to a wide range of AI models and libraries, including OpenAI, Gemini, Mistral, and Stability. 
2. **Controller Layer**: Acts as a central hub, providing a unified input regardless of the AI model you're using. Allowing to switch between model providers with minimum change.
3. **Function Layer**: Provides abstract application layer, focused on real world use cases. You can extend the use cases of intelli based on your specific needs.
4. **Flow Layer**: Orchestrates complex workflows involving multiple AI models and tasks.


### Example

```python
from intelli.model.input.chatbot_input import ChatModelInput
from intelli.function.chatbot import Chatbot

# selected model
provider = "mistral"
model = "mistral-medium"

# prepare common input 
input = ChatModelInput("You are a helpful assistant.", model)
input.add_user_message("What is the capital of France?")

# creating chatbot instance
openai_bot = Chatbot(YOUR_MISTRAL_API_KEY, provider)
response = openai_bot.chat(input)
```

## License
This project is licensed under Apache 2.0.
