---
sidebar_position: 3
---

# Quick start

### Installation

```bash
pip install intelli
```

### Chatbot
Use the same call to try multiple chatbot providers.
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

### Vision
Add a visual dimension to your AI interactions with Intelli's vision capabilities. 

```python
import os
from intelli.model.input.vision_input import VisionModelInput
from intelli.controller.remote_vision_model import RemoteVisionModel

# prepare the image and prompt
image_path = 'temp/test_image_desc.png' 
prompt = "Describe the image"

# prepare the vision objects
vision_input = VisionModelInput(content=prompt, file_path=image_path, model=model_name)
controller = RemoteVisionModel(openai_api_key, 'openai') # or gemini

# generate image description
result = controller.image_to_text(vision_input)
```

### Flow

Example of a sequence flow for content creation pipeline.

```python
from intelli.flow.agents.agent import Agent
from intelli.flow.tasks.task import Task
from intelli.flow.sequence_flow import SequenceFlow
from intelli.flow.input.task_input import TextTaskInput
from intelli.flow.processors.basic_processor import TextProcessor

# define agents
blog_agent = Agent(agent_type='text', provider='openai', mission='write blog posts', model_params={'key': YOUR_OPENAI_API_KEY, 'model': 'gpt-4'})
copy_agent = Agent(agent_type='text', provider='gemini', mission='generate description', model_params={'key': YOUR_GEMINI_API_KEY, 'model': 'gemini'})
artist_agent = Agent(agent_type='image', provider='stability', mission='generate image', model_params={'key': YOUR_STABILITY_API_KEY})

# define tasks
task1 = Task(TextTaskInput('blog post about electric cars'), blog_agent, log=True)
task2 = Task(TextTaskInput('Generate short image description for image model'), copy_agent, pre_process=TextProcessor.text_head, log=True)
task3 = Task(TextTaskInput('Generate cartoon style image'), artist_agent, log=True)

# start sequence flow
flow = SequenceFlow([task1, task2, task3], log=True)
final_result = flow.start()
```

Explore more capabilities in the dedicate pages.
