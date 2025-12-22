---
sidebar_position: 7
---
# Tasks

Tasks are the core units of action in intelli workflows. Each task handles a defined input type, processes it using a designated agent, and optionally applies pre-processing and post-processing steps.

## Latest Improvements

The Task implementation has been enhanced with:

- **Improved Input/Output Handling**: Better management of different data types between tasks
- **Enhanced Pre/Post Processing**: More robust processing capabilities
- **Optimized Data Flow**: Smarter handling of data passed between connected tasks
- **Better Type Compatibility**: Improved matching of input/output types across different agent types

## Parameters

Constructing a task requires providing these parameters:

- **task_input**: An AgentInput instance, like TextAgentInput or ImageAgentInput.
- **agent**: The Agent instance responsible for executing the task.
- **exclude** (optional): A flag indicating whether to exclude the task's output from the final result (defaults to False).
- **pre_process** (optional): A function to manipulate input data before sending it to the agent.
- **post_process** (optional): A function to modify output data returned by the agent.
- **template** (optional): A template to format the input data (uses default TextInputTemplate for text inputs).
- **log** (optional): A boolean indicating whether to enable logging (defaults to False).
- **model_params** (optional): Additional model parameters to override defaults when executing the agent.

## Example

```python
from intelli.flow.tasks.task import Task
from intelli.flow.input.task_input import TextTaskInput
from intelli.flow.agents.agent import Agent
from intelli.flow.processors.basic_processor import TextProcessor

# Define an agent
text_agent = Agent(
    agent_type='text',
    provider='openai',
    mission='write a blog post',
    model_params={'key': 'YOUR_OPENAI_API_KEY', 'model': 'gpt-4'}
)

# Define a task input
task_input = TextTaskInput(desc="Write a blog post about climate change.")

# Create a task with pre-processing
task = Task(
    task_input=task_input, 
    agent=text_agent, 
    pre_process=TextProcessor.text_head,  # Limit input size
    log=True
)
```

## Advanced Task Configuration

### Dynamic Model Parameters

You can override model parameters when executing a task:

```python
# Define a task with custom model parameters
advanced_task = Task(
    task_input=TextTaskInput("Analyze this technical content"),
    agent=text_agent,
    model_params={
        "temperature": 0.2,  # Lower temperature for more focused output
        "max_tokens": 1000   # Increase token limit for this specific task
    },
    log=True
)
```

### Custom Pre-Processing

Create custom pre-processing functions to transform input data:

```python
def extract_keywords(text):
    """Extract the most important keywords from text"""
    # Simple implementation - in practice, you might use NLP techniques
    words = text.split()
    return " ".join([word for word in words if len(word) > 5][:10])

# Task with custom pre-processing
summary_task = Task(
    task_input=TextTaskInput("Summarize the main points from this article"),
    agent=text_agent,
    pre_process=extract_keywords,  # Extract keywords before sending to the agent
    log=True
)
```

### Custom Templates

You can create custom templates to format task inputs:

```python
from intelli.flow.template.basic_template import TextInputTemplate

# Create a custom template for summarization
summary_template = TextInputTemplate(
    "Please provide a concise summary of the following text:\n\n{0}\n\nInclude only the most important points."
)

# Task with custom template
task_with_template = Task(
    task_input=TextTaskInput("Summarize this content"),
    agent=text_agent,
    template=summary_template,
    log=True
)
```

### Task Exclusion

You can exclude tasks from the final output while still using their results in the workflow:

```python
# Intermediate task whose output we don't need in the final results
intermediate_task = Task(
    task_input=TextTaskInput("Generate keywords from this content"),
    agent=text_agent,
    exclude=True,  # This task's output won't appear in the final results
    log=True
)
```

This is useful for tasks that produce intermediate results that are only needed for subsequent tasks but not in the final output.
