---
sidebar_position: 4
---

# Agents

An `Agent` is an executor of a specific action or task. It interfaces with AI models or providers, such as chatGPT, gemini, stable diffusion, or any other supported models, to perform operations like text generation, speech, image processing, or vision tasks.

### Parameters

When creating an `Agent`, you need to provide several parameters that define its behavior:

- **agent_type**: Determines the kind of actions it can perform. Accepted types are defined in `AgentTypes` (e.g., `text`, `image`, `vision`, `speech`).
- **provider**: The name of the AI model or service provider (e.g., `openai`, `gemini`, `stability`).
- **mission**: A mission statement guiding the agent's task. It often serves as the system input for AI models.
- **model_params**: A dictionary containing the AI model parameters, such as API keys, model names, temperature, and any additional configuration needed for operation.
- **options** (optional): Additional options that may affect the agent's execution or interaction with the AI model/service.


### Agent Types

The Intelli framework currently supports the following agent types:

- `'text'`: Agents that generate or manipulate text.
- `'image'`: Agents designed for image generation tasks.
- `'vision'`: Agents that perform image to text tasks.

### Example

#### Creating an Agent

Instantiate the `Agent` class with the appropriate parameters:

```python
from intelli.flow.agents.agent import Agent

text_agent = Agent(
    agent_type='text',
    provider='openai',
    mission='write a blog post',
    model_params={'key': 'YOUR_OPENAI_API_KEY', 'model': 'gpt-3.5-turbo'}
)
```

#### Executing an Agent

To execute an agent, you need to provide an input specific to the agent's type. The Intelli framework offers different input classes such as `TextAgentInput`and `ImageAgentInput`. Usually the task handle the agent execution, so **you don't have to execute manually**.


Here's how to execute a text agent:

```python
from intelli.flow.input.agent_input import TextAgentInput

# creating a text input
agent_input = TextAgentInput(desc="What is the capital of France?")

# Executing the agent
result = text_agent.execute(agent_input)
```

