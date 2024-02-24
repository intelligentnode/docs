---
sidebar_position: 1
---

# Get started

The flow provide a structured approach to orchestrating complex tasks that involve multiple operations such as text, image, vision and speech. By leveraging the flow concept, you can execute a sequence of tasks efficiently.

### Components
The flow implementation is built around several key components:
- **Agent**: The executor of specific action or task. Each agent is designed to interface with a particular model or service.
- **Task**: A task defines which operation to perfome and which agent is responsible for executing it.
- **Processor**: An optional component that manipulate the input or output of tasks, allowing for additional flexibility over the flow's execution.
- **Flow**: The orchestrators that manage the execution of tasks with two types (SequenceFlow, AsyncFlow).

### Example
To begin working with Flows you need to define your workflow agents and tasks. Here's a simple example to demonstrate how to set up a basic Flow:
```python
from intelli.flow.types import *
from intelli.flow.agents.agent import Agent
from intelli.flow.tasks.task import Task
from intelli.flow.sequence_flow import SequenceFlow
from intelli.flow.input.task_input import TextTaskInput
from intelli.flow.processors.basic_processor import TextProcessor

# define Agents
text_agent = Agent(agent_type=AgentTypes.TEXT.value, provider='openai', mission='you are a writing assistant', model_params={'key': YOUR_OPENAI_KEY, 'model': 'gpt-3'})
image_agent = Agent(agent_type=AgentTypes.IMAGE.value, provider='stability', mission='Generate banner images for blog posts', model_params={'key': YOUR_STABILITY_KEY})

# define Tasks
task1 = Task(TextTaskInput('Write a blog post about climate change.'), agent=text_processor_agent, log=True)
task2 = Task(TextTaskInput('Generate image about the post topic'), agent=image_agent, log=True, pre_process=TextProcessor.text_head)

# setup Sequence Flow
flow = SequenceFlow([task1, task2], log=True)

# execute the Flow
flow_output = flow.start()

print(flow_output)
```

Check the async flow page to build flows using the graph theory for advanced use cases.

