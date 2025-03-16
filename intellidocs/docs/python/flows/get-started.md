---
sidebar_position: 1
---
# Get Started

The flow provides a structured approach to orchestrating complex tasks that involve multiple operations such as text generation, image creation, vision analysis, and speech processing. By leveraging the flow concept, you can execute a sequence of tasks efficiently, passing data between them as needed.

## Latest Updates

The framework has been significantly enhanced with:

- **Modular Agent Architecture**: Specialized handlers for different agent types (text, image, vision, speech) improving code organization and extensibility
- **Enhanced File Handling Utilities**: Robust utilities for processing different output formats (text, audio, image)
- **Improved Model Compatibility**: Better integration between different providers and model types
- **Optimized Test Workflows**: Streamlined helper methods for easier testing and development

## Components

The flow implementation is built around several key components:

- **Agent**: The executor of specific action or task. Each agent is designed to interface with a particular model or service (like OpenAI, Mistral, StabilityAI, etc.).
- **Task**: A task defines which operation to perform and which agent is responsible for executing it, along with pre/post-processing requirements.
- **Processor**: An optional component that manipulates the input or output of tasks, allowing for additional flexibility over the flow's execution.
- **Flow**: The orchestrator that manages the execution of tasks with two types (SequenceFlow for linear workflows, AsyncFlow for complex dependencies).

## Example

To begin working with Flows you need to define your workflow agents and tasks. Here's a simple example to demonstrate how to set up a basic Flow:

```python
from intelli.flow.types import AgentTypes
from intelli.flow import Agent, Task, SequenceFlow, TextTaskInput, TextProcessor

# Define Agents
text_agent = Agent(
    agent_type=AgentTypes.TEXT.value, 
    provider='openai', 
    mission='you are a writing assistant', 
    model_params={
        'key': YOUR_OPENAI_KEY, 
        'model': 'gpt-4o'
    }
)

image_agent = Agent(
    agent_type=AgentTypes.IMAGE.value, 
    provider='stability', 
    mission='Generate banner images for blog posts', 
    model_params={
        'key': YOUR_STABILITY_KEY
    }
)

# Define Tasks
task1 = Task(
    TextTaskInput('Write a blog post about climate change.'), 
    agent=text_agent, 
    log=True
)

task2 = Task(
    TextTaskInput('Generate image about the post topic'), 
    agent=image_agent, 
    log=True, 
    pre_process=TextProcessor.text_head
)

# Setup Sequence Flow
flow = SequenceFlow([task1, task2], log=True)

# Execute the Flow
flow_output = flow.start()
print(flow_output)
```

Check the [Async Flow page](async-flow) to build flows using graph theory for advanced use cases with complex dependencies.

## Saving Flow Outputs

The framework now includes convenient utilities for saving flow outputs:

```python
from intelli.utils.flow_helper import FlowHelper

# Save text output
FlowHelper.save_text_output(flow_output['task1'], 'blog_post.md')

# Save image
FlowHelper.save_image_output(flow_output['task2'], 'banner.png')
```

These helper functions handle different data formats automatically, making it easier to work with the outputs of your flows.
