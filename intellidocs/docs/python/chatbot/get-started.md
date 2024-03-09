---
sidebar_position: 1
---

# Get started

The intelli chatbot function connect with multiple leading AI models such as chatGPT, gemini, and mistral. It allows developers to build chat systems capable of handling complex dialogues and chat with your docs. One of the key features of the intelli chatbot is its ability to switch between different AI providers, offering flexibility based on the needs of the application and ability to upgrade to latest models without code changes in your apps.

### Core Components


**ChatModelInput:** This class provide unified entry to all chatbot providers. It encapsulates details such as the chat system, model preference, message history, and various AI model-specific parameters like temperature, max tokens, and more. 

**Chatbot:** The primary class that interfaces with different AI providers. It requires API credentials, the provider name. You can extend the functionality using optional parameters for proxies and search capabilities via intellibode cloud.


### Available Models and Capabilities

The python version support the following providers:

- **Openai**: `provider='openai'`.
- **Gemini**: `provider='gemini'`.
- **Mistral**: `provider='mistral'`.
- **Anthropic**: `provider='anthropic'`.
- **Azure**: `provider=`'openai'.

### Example

##### Imports
```python
from intelli.model.input.chatbot_input import ChatModelInput
from intelli.function.chatbot import Chatbot
```


##### Prepare the input
```python
chat_input = ChatModelInput(system="You are a helpful assistant.", model="gpt-3.5")
chat_input.add_user_message("Explain the plot of the Inception movie in one line.")
```

##### Call the chatbot
```python
chatbot = Chatbot(api_key=YOUR_API_KEY, provider="openai")
response = chatbot.chat(chat_input)
```
