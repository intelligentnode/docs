---
sidebar_position: 5
---
# Keras Agent

An Agent is an executor of a specific action. The `KerasAgent` provides the capabilities to load offline open source models using keras to be part of the tasks flow. 

## Latest Improvements

The KerasAgent implementation has been enhanced with:

- **Improved Flow Integration**: Better compatibility with the overall flow architecture
- **Enhanced Audio Processing**: Improved handling of audio data for speech recognition
- **Optimized Model Loading**: More efficient loading and initialization of Keras models
- **Extended Model Support**: Compatibility with more open-source models

## Parameters

When creating a `KerasAgent`, you need to provide several parameters that define its behavior:

- **agent_type**: Determines the kind of actions it can perform. Accepted types are defined in `AgentTypes`.
- **mission** (optional): A mission statement guiding the agent's task. It often serves as the system input for AI models.
- **model_params**: A dictionary containing the keras model parameters, such as `model` and `max_length`.
- **log**: Track the model stage for debugging, default is `False`.

## Supported Models

- gemma_2b_en
- gemma_instruct_2b_en
- gemma_7b_en
- gemma_instruct_7b_en
- mistral_7b_en
- mistral_instruct_7b_en
- whisper_tiny_en (for speech recognition)
- whisper_base_en (for speech recognition)
- whisper_small_en (for speech recognition)

## Example

### Creating Keras Agents

Instantiate the `KerasAgent` class with the appropriate parameters:

```python
from intelli.flow.agents.kagent import KerasAgent
```

Gemma agent:
```python
gemma_params = {
    "model": "gemma_2b_en",
    "max_length": 200
}
gemma_agent = KerasAgent(
    agent_type="text",
    mission="writing assistant",
    model_params=gemma_params,
    log=True
)
```

Mistral agent:
```python
mistral_params = {
    "model": "mistral_instruct_7b_en",
    "max_length": 200
}
mistral_agent = KerasAgent(
    agent_type="text",
    mission="social media assistant",
    model_params=mistral_params,
    log=True
)
```

Whisper agent for speech recognition:
```python
whisper_params = {
    "model_name": "whisper_tiny_en",
    "language": "<|en|>",
    "max_steps": 80,
    "max_chunk_sec": 30
}
whisper_agent = KerasAgent(
    agent_type="recognition",
    mission="transcribe audio accurately",
    model_params=whisper_params,
    log=True
)
```

### Executing Keras Agents

The task handles the agent execution as part of the flow. Below is a full example to execute the agent:

```python
from intelli.flow.tasks.task import Task
from intelli.flow.input.task_input import TextTaskInput
from intelli.flow import SequenceFlow

# Create the tasks with the prompt instructions, you can assign the same agent to all tasks.
task1 = Task(
    TextTaskInput("write blog post about electric cars"), 
    gemma_agent, 
    log=True
)
task2 = Task(
    TextTaskInput("write short social media post from the context"), 
    mistral_agent, 
    log=True
)

# Create and execute the flow
flow = SequenceFlow(order=[task1, task2], log=True)
final_result = flow.start()
```

## Advanced Usage: Local + Cloud Model Integration

You can combine local Keras models with cloud models for hybrid workflows that balance cost, privacy, and performance:

```python
# Define agents
local_agent = KerasAgent(
    agent_type="text",
    mission="initial content draft",
    model_params={"model": "mistral_7b_en", "max_length": 300},
    log=True
)

cloud_agent = Agent(
    agent_type="text",
    provider="openai",
    mission="polish and refine content",
    model_params={"key": OPENAI_API_KEY, "model": "gpt-4o"}
)

# Create tasks
draft_task = Task(
    TextTaskInput("Write a technical blog post about LLM workflows"), 
    local_agent, 
    log=True
)

polish_task = Task(
    TextTaskInput("Improve this draft with better structure and examples"), 
    cloud_agent, 
    log=True
)

# Execute flow
flow = SequenceFlow(order=[draft_task, polish_task], log=True)
result = flow.start()
```

This approach lets you use efficient local models for initial processing and cloud models for refinement when needed.
