---
sidebar_position: 6
---

# Llama CPP

Llama CPP provides an efficient way to run language models locally on consumer devices. With support for models in the new **GGUF** format, you can run lightweight models for chat and code generation tasks without relying on external APIs.

## Supported Models

Some of the recommended models include:

- **TinyLlama 1.1B Chat**.
  A small chat model ideal for conversational tasks.

- **DeepSeek-R1-Distill-Qwen-1.5B**.
  An instruct-tuned model offering decent performance with various quantizations (e.g. Q3_K_M).  

- **Gemma-2-2b-it**.
  A 2B model fine-tuned for general text tasks; available in a Q4_K_M quantization for balanced quality and efficiency.

- **Any GGUF model** .

## Installation and Setup

### Prerequisites

- Install Intellinode via pip (with the optional llama-cpp extra):
```python
pip install intelli[llamacpp]
```

### Downloading Models

You can download the models using the Hugging Face Hub. For example, to download TinyLlama 1.1B Chat:
```python
huggingface-cli download TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --local-dir ./models
```

To download DeepSeek-Qwen-1.5B and Qwen2.5-Coder-3B-Instruct:
```python
huggingface-cli download bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF DeepSeek-R1-Distill-Qwen-1.5B-Q3_K_M.gguf --local-dir ./models
```

And for gemma-2-2b-it:
```python
huggingface-cli download bartowski/gemma-2-2b-it-GGUF gemma-2-2b-it-Q4_K_M.gguf --local-dir ./models
```


## Using the Chatbot with Llama CPP

### Importing the Chatbot

Import the necessary classes:
```python
from intelli.function.chatbot import Chatbot, ChatProvider
from intelli.model.input.chatbot_input import ChatModelInput
```

### Initializing the Chatbot

Set up the model options for llama.cpp by providing the local model path and necessary parameters. For example, to initialize with TinyLlama 1.1B Chat:
```python
options = {
    "model_path": "./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    "model_params": {
        "n_ctx": 512,
        "embedding": False,
        "verbose": False
    }
}

llama_bot = Chatbot(provider=ChatProvider.LLAMACPP, options=options)
```

### Generating a Chat Response

Prepare your conversation using ChatModelInput and then call the chatbot:
```python
chat_input = ChatModelInput("You are a helpful assistant.", model="llamacpp", max_tokens=64, temperature=0.7)
chat_input.add_user_message("What is the capital of France?")

response = llama_bot.chat(chat_input)
print("Chat Response:", response["result"][0])
```

### Streaming Chat Responses

For streaming output (token-by-token), use:
```python
import asyncio

async def stream_chat():
    chat_input = ChatModelInput("You are a helpful assistant.", model="llamacpp", max_tokens=64, temperature=0.7)
    chat_input.add_user_message("Tell me a joke.")
    output = ""
    async for token in llama_bot.stream(chat_input):
        output += token
    print("Streaming Chat Response:", output)

asyncio.run(stream_chat())
```

### Using Qwen2.5-Coder
```python
options = {
    "model_path": "./models/qwen2.5-3b-coder-instruct-q4_0.gguf",
    "model_params": {
        "n_ctx": 1024,
        "embedding": False,
        "verbose": False
    }
}

qwen_bot = Chatbot(provider=ChatProvider.LLAMACPP, options=options)
```

Then, to generate code:
```python
chat_input = ChatModelInput("You are a coding assistant.", model="llamacpp", max_tokens=128, temperature=0.3)
chat_input.add_user_message("Write a Python function to reverse a string.")
response = qwen_bot.chat(chat_input)
print("Code Generation Output:", response["result"][0])
```


> **Note:** You can suppress noisy logs from llama.cpp by redirecting stderr during model loading.

## Conclusion

By following these steps, you can run an offline chatbot using llama.cpp with high performance. The GGUF format ensures efficient memory usage and fast inference on typical hardware.
