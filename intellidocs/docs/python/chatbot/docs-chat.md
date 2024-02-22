---
sidebar_position: 4
---

# Docs chat

Connecting the chatbot to external data enriches the conversation with context-specific knowledge, making responses more relevant to your usecase. The intellinode cloud facilitates this by indexing your documents and generating a One Key for secure access using the `Chatbot` functionality.

### Steps
**Uploading Documents:**
1. Navigate to the [Intellinode app](https://app.intellinode.ai/).
2. Create a new project with the Document option - available for free.
3. Upload your desired documents or images.
4. Copy the generated One Key.

**Implementation:**
```python
from intelli.model.input.chatbot_input import ChatModelInput
from intelli.function.chatbot import Chatbot

# Initialize the chatbot with your API key and the One Key
chatbot = Chatbot(api_key=YOUR_API_KEY, provider="mistral", options={"one_key": INTELLI_ONE_KEY})

# Prepare the input with attachment references
chat_input = ChatModelInput(system="You are a helpful assistant.", model="mistral-medium")
chat_input.attach_reference = True
chat_input.add_user_message("Explain the concept of relativity.")

response = chatbot.chat(chat_input)
# Parse the response
print("the responses: ", response["result"])
print("the referenced documents: ", response["references"])
```

The `attach_reference` parameter instructs the chatbot to append the used data sources to generate the response.
