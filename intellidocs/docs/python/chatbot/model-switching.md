---
sidebar_position: 3
---

# Model switching


Switching between models is straightforward, as Intelli framework decouples your business logic from the underlying model implementation, ensuring minimal code changes.

### Example

```python
from intelli.model.input.chatbot_input import ChatModelInput
from intelli.function.chatbot import Chatbot

def call_chatbot(provider, model=None):
    # prepare common input 
    input = ChatModelInput("You are a helpful assistant.", model)
    input.add_user_message("What is the capital of France?")

    # creating chatbot instance
    openai_bot = Chatbot(YOUR_API_KEY, provider)
    response = openai_bot.chat(input)

    return response

# call openai
call_chatbot("openai", "gpt-4")

# call mistralai
call_chatbot("mistral", "mistral-medium")

# call google gemini
call_chatbot("gemini")
```
