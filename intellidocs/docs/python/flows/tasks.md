---
sidebar_position: 6
---

# Tasks

Tasks are the core units of action in intelli workflows. Each task handles a defined input type, processes it using a designated agent, and optionally applies pre-processing and post-processing steps.

### Parameters
Constructing a task requires providing these parameters:

- **task_input**: An AgentInput instance, like TextAgentInput or ImageAgentInput, carrying the primary data or information the task manipulates.
- **agent**: The Agent instance responsible for executing the task.
- **exclude** (optional): A flag indicating whether to exclude the task's output from the final result (defaults to False).
- **pre_process** (optional): A function to manipulate input data before sending it to the agent.
- **post_process** (optional): A function to modify output data returned by the agent.
- **template** (optional): A template to format the input data (uses default TextInputTemplate for text inputs).
- **log** (optional): A boolean indicating whether to enable logging (defaults to False).

### Example

```python
from intelli.flow.tasks.task import Task
from intelli.flow.input.agent_input import TextAgentInput
from intelli.flow.agents.agent import Agent

# define an agent
text_agent = Agent(
    agent_type='text',
    provider='openai',
    mission='write a blog post',
    model_params={'key': 'YOUR_OPENAI_API_KEY', 'model': 'gpt-4'}
)

# define a task input
task_input = TextAgentInput(desc="Write a blog post about climate change.")

# create a task
task = Task(task_input=task_input, agent=text_agent, log=True)
```
