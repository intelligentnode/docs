---
sidebar_position: 1
---

# Content platform

## Scenario: Building a Blog with AI Content Creation

Imagine you are developing a blogging platform focused on environmental topics. To automate content creation and related tasks, you will utilize various AI services such as language generation, image processing, and code generation models. Tasks might include generating article outlines, creating task lists, designing logos, and more.

### Step 1: Setting Up Your Environment

Set up a `.env` file in your project's root directory with your API keys:

```plaintext
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
STABILITY_API_KEY=your_stability_ai_key_here
```

Load these variables in your script using:

```python
from dotenv import load_dotenv
import os

load_dotenv()  # Take environment variables from .env.

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")
```

### Step 2: Creating Agents and Tasks

Define the agents that correspond to the services your tasks will use. Each agent is responsible for a particular type of operation, such as interfacing with a specific AI model.

**Example of defining agents**:

```python
from intelli.flow.agents.agent import Agent

text_generator = Agent("text", "gemini", "write specifications", {"key": GEMINI_API_KEY, "model": "gemini"})
coder_agent = Agent("text", "openai", "write python code", {"key": OPENAI_API_KEY, "model": "gpt-3.5-turbo"})
ux_designer = Agent("text", "openai", "user experience and designer", {"key": OPENAI_API_KEY, "model": "gpt-3.5-turbo"})
image_desc_creator = Agent("text", "openai", "write image description", {"key": OPENAI_API_KEY, "model": "gpt-3.5-turbo"})
image_processor = Agent("image", "stability", "generate logo with colorful style", {"key": STABILITY_API_KEY})
```

**Creating Tasks**:

Tasks are the units of work managed by `intelli`. Here's how to define a simple task that uses one of the agents:

```python
from intelli.flow.tasks.task import Task
from intelli.flow.input.task_input import TextTaskInput

task1 = Task(
    TextTaskInput("Identify requirements for building a blogging website about the environment"),
    text_generator,
    log=True
)

task2 = Task(
    TextTaskInput("Generate the website description and theme details from the requirements"),
    ux_designer,
    log=True
)

task3 = Task(
    TextTaskInput("Generate short image description for image model"),
    image_desc_creator,
    log=True
)

task4 = Task(
    TextTaskInput("Design logo from the description"),
    image_processor,
    log=True,
    exclude=True
)

task5 = Task(
    TextTaskInput("Generate code based on combined tasks"),
    coder_agent,
    log=True
)
```

### Step 3: Orchestrating the Flow

With agents and tasks defined, the next step is to create and execute a flow. The flow orchestrates task execution, managing dependencies and ensuring tasks are executed asynchronously where possible.

**Example of setting up a flow**:

```python
from intelli.flow.flow import Flow
import asyncio

async def main():
    flow = Flow(
        tasks={
            "task1": task1,
            "task2": task2,
            "task3": task3,
            "task4": task4,
            "task5": task5,
        },
        map_paths={
            "task1": ["task2", "task5"],
            "task2": ["task3", "task5"],
            "task3": ["task4"],
            "task5": [],
        },
        log=True
    )

    output = await flow.start()
    print("Final output:", output)

if __name__ == "__main__":
    asyncio.run(main())
```

You can generate a visual image for the graph:
```python
flow.generate_graph_img(name='content_flow_graph', save_path='../temp')
```


### Conclusion

This quick guide introduces the basic components and steps to automate workflows with `intelli`. By leveraging asynchronous execution, `intelli` helps optimize operations that involve external APIs, I/O tasks, or lengthy computations, making it ideal for projects related to AI, web scraping, data processing, and more.

Whether you're aggregating content from various sources, coordinating microservices, or automating content generation, `intelli` offers a structured approach to managing complex asynchronous flows effectively.
