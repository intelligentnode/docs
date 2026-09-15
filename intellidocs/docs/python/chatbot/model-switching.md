---
sidebar_position: 3
---

# Model switching


Switching between models is straightforward, as intelli framework decouples your business logic from the underlying model implementation, ensuring minimal code changes.

### Example

```python
from intelli.model.input.chatbot_input import ChatModelInput
from intelli.function.chatbot import Chatbot, ChatProvider

def call_chatbot(provider, model=None):
    # prepare common input 
    input = ChatModelInput("You are a helpful assistant.", model)
    input.add_user_message("What is the capital of France?")

    # creating chatbot instance
    openai_bot = Chatbot(YOUR_API_KEY, provider)
    response = openai_bot.chat(input)

    return response

# call chatGPT
call_chatbot(ChatProvider.OPENAI, "gpt-5.5")

# call mistralai
call_chatbot(ChatProvider.MISTRAL, "mistral-large-latest")

# call claude
call_chatbot(ChatProvider.ANTHROPIC, "claude-sonnet-5")

# call google gemini
call_chatbot(ChatProvider.GEMINI)
```
