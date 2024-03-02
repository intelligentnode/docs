---
sidebar_position: 7
---

# Processors

Processors is a tool to shape your workflow precisely. These functions work as data wranglers, manipulating information before or after tasks interact with agents.

### Pre-Processing

Pre-processor applied to the data before the agent execution step. It take the output of the previous task (or the initial input).

**Example**

A common scenario involves text truncation to fit AI model limitations.

```python
def text_head(text, size=800):
    """Shorten text to fit within size limit."""
    return text[:size]

from intelli.flow.tasks.task import Task
task = Task(task_input=task_input, agent=text_agent, pre_process=text_head)
```

### Post-Processing

Post-processor applied on the agent output.

**Example**

Want to append a disclaimer to AI-generated text? Here's a post-processor.

```python
def append_disclaimer(text, disclaimer="This is generated text."):
    """Attach a disclaimer to the text."""
    return text + "\n\n" + disclaimer
```
