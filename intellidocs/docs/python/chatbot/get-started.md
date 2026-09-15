---
sidebar_position: 1
title: "AI Chatbot for OpenAI, Gemini and Mistral in Python"
sidebar_label: "Get started"
description: "Set up the Python chatbot with ChatModelInput and Chatbot. Use provider selection, default models, and GPT-5 options for OpenAI, Gemini, and Mistral."
keywords: ["intelli python chatbot","python chatbot openai gemini","chatmodelinput intelli","intelli chatbot providers","gpt-5 python chatbot","pip install intelli"]
---

# Get started

The intelli chatbot function connect with multiple leading AI models such as chatGPT, gemini, and mistral. It allows developers to build chat systems capable of handling complex dialogues and chat with your docs. One of the key features of the intelli chatbot is its ability to switch between different AI providers, offering flexibility based on the needs of the application and ability to upgrade to latest models without code changes in your apps.

### Core Components


**ChatModelInput:** This class provide unified entry to all chatbot providers. It encapsulates details such as the chat system, model preference, message history, and various AI model-specific parameters like temperature, max tokens, and more. 

**Chatbot:** The primary class that interfaces with different AI providers. It requires API credentials, the provider name. You can extend the functionality using optional parameters for proxies and search capabilities via intellibode cloud.


### Available Models and Capabilities

The python version support the following providers:

- **Openai**.
- **Gemini**.
- **Mistral**.
- **Anthropic**.
- **Azure**.
- **DeepSeek**.
- **Llama3**.

Use `ChatProvider` enum for selecting your chatbot model.

### Example

##### Imports
```python
from intelli.model.input.chatbot_input import ChatModelInput
from intelli.function.chatbot import Chatbot, ChatProvider
```


##### Prepare the input
```python
chat_input = ChatModelInput(system="You are a helpful assistant.", model="gpt-5.5")
chat_input.add_user_message("Explain the plot of the Inception movie in one line.")
```

##### Call the chatbot
```python
chatbot = Chatbot(api_key=YOUR_API_KEY, provider=ChatProvider.OPENAI)
response = chatbot.chat(chat_input)
```

### Default Models

When you omit the model, intelli picks a current default for the provider:

| Provider | Default model |
| -------- | ------------- |
| Openai | `gpt-5.5` |
| Anthropic | `claude-sonnet-5` |
| Gemini | `gemini-2.5-flash` |
| Mistral | `mistral-large-latest` |

Use `claude-opus-5` for the larger Anthropic model. The Claude 5 family and Opus 4.7 and above dropped the sampling parameters, so intelli omits `temperature` for those models and they work without any change on your side.

### GPT-5 Parameters

The GPT-5 family runs on the responses API, and the input accepts its parameters:

```python
chat_input = ChatModelInput(
    system="You are a helpful assistant.",
    model="gpt-5.5",
    reasoning_effort="low",   # low, medium, high, xhigh, none
    verbosity="medium",       # low, medium, high
    max_tokens=512,           # sent as max_output_tokens
)
```

`tool_choice` is available as well, on both the openai and the anthropic paths. To force the classic chat completions endpoint for a GPT-5 deployment, add `:chat` to the model id, for example `gpt-5.5:chat`.
