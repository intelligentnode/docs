---
sidebar_position: 5
---

# Keras Agent

An Agent is an executor of a specific action. The `KerasAgent` provide the capabilities to load offline open source models using keras to be part of the tasks flow. 

### Parameters

When creating an `KerasAgent`, you need to provide several parameters that define its behavior:

- **agent_type**: Determines the kind of actions it can perform. Accepted types are defined in `AgentTypes`.
- **mission** (optional): A mission statement guiding the agent's task. It often serves as the system input for AI models.
- **model_params**: A dictionary containing the keras model parameters, such as `model` and `max_length`.
- **log**: Track the model stage for debugging, default is `False`.

### Supported Models
- gemma_2b_en.
- gemma_instruct_2b_en.
- gemma_7b_en.
- gemma_instruct_7b_en.
- mistral_7b_en.
- mistral_instruct_7b_en.

### Example

#### Creating Keras Agents

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
gemma_agent = KerasAgent(agent_type="text",
                        mission="writing assistant",
                        model_params=gemma_params,
                        log=True)
```

Mistral agent:
```python
mistral_params = {
            "model": "mistral_instruct_7b_en",
            "max_length": 200
        }
mistral_agent = KerasAgent(agent_type="text",
                        mission="social media assistant",
                        model_params=mistral_params,
                        log=True)
```


#### Executing Keras Agents

The task handle the agent execution as part of the flow, below is full example to execute the agent:


```python
# create the tasks with the prompt instructions, you can asign the same agent to all tasks.
task1 = Task(
            TextTaskInput("write blog post about electric cars"), gemma_agent, log=True
        )
task2 = Task(
            TextTaskInput("write short social media post from the context"), mistral_agent, log=True
        )

# create and execute the flow
flow = SequenceFlow(order=[task1, task2], log=True)
final_result = flow.start()
```

