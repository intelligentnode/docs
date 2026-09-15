---
sidebar_position: 2
title: "Multi-Turn Chat Conversations in Python"
sidebar_label: "Multiple messages"
description: "Learn how to pass conversation history to Intelli Python chatbots with ChatModelInput, adding user and assistant messages for context and few shot behavior."
keywords: ["intelli python chatbot messages","chatmodelinput conversation history","python chatbot multiple messages","intelli add user message","intelli add assistant message","few shot chatbot context"]
---

# Multiple messages

Intelli chatbot understand the conversation flow using the passed hisoty messages. `ChatModelInput` facilitates the ability to add a sequential of messages from both the user and the assistant. You can look to messages as a way to provide conversation context or tune the model to response in specific way adapting few shot learners method.

### Example

```python
from intelli.model.input.chatbot_input import ChatModelInput

chat_input = ChatModelInput(system="You are a helpful assistant.", model="mistral-large-latest")
# add the messages hisoty
chat_input.add_user_message("What's the scientific name for a tomato?")
chat_input.add_assistant_message("The scientific name for a tomato is Solanum lycopersicum.")
chat_input.add_user_message("Is it a fruit or a vegetable?")
chat_input.add_assistant_message("Botanically, a tomato is considered a fruit.")
chat_input.add_user_message("What are its nutritional benefits?")
```
