---
sidebar_position: 3
---

# Async flow

The intelli framework supports asynchronous execution workflows, enabling you to manage complex tasks involving multilpe AI models, I/O operations, and lengthy computations efficiently. The `AsyncFlow` utilizes a Directed Acyclic Graph (DAG) to represent tasks and their dependencies. This structure allows Intelli to determine the execution order, ensuring that each task receives the necessary inputs from its predecessors. 

### Benefits of Async Flow
- Asynchronous processing empowers intelli to parallel the execution of independent tasks.
- Complex workflows often necessitate changes, the intelli graph-based approach simplifies this process by automatically handling the tasks flow changes.
- Visualizing the interaction between models.

### Async Flow Parameters
The parameters for controlling your workflows:
- `tasks`: a dictionary to map your workflow tasks with names.
- `map_paths`: a dictionary defining the dependencies between tasks in your workflow using the name.
- `log`: a boolean flag (default: False) enabling logging functionality. 

### Example
Imagine you are developing a blogging platform focused on environmental topics. To automate the related tasks, you will utilize various AI services such as language generation, image processing, and code generation models. Here is a simplified example of building and executing an asynchronous flow for content creation:

#### Step 1: Setting Up Your Environment

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

load_dotenv() 

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")
```

#### Step 2: Creating Agent

Define the agents that correspond to the services your tasks will use. Each agent is responsible for a interface with a specific AI model or service.

```python
from intelli.flow.agents import Agent

text_generator = Agent("text", "gemini", "write specifications", {"key": GEMINI_API_KEY, "model": "gemini"})
task_creator = Agent("text", "openai", "create task list", {"key": OPENAI_API_KEY, "model": "gpt-3.5-turbo"})
ux_designer = Agent("text", "openai", "user experience and designer", {"key": OPENAI_API_KEY, "model": "gpt-3.5-turbo"})
image_desc_creator = Agent("text", "openai", "write image description", {"key": OPENAI_API_KEY, "model": "gpt-3.5-turbo"})
image_processor = Agent("image", "stability", "generate logo with colorful style", {"key": STABILITY_API_KEY})
```

#### Step 3: Creating Tasks

Tasks are the units of work, here's how to define a simple task that uses one of the agents:

```python
from intelli.flow.tasks import Task
from intelli.flow.input import TextTaskInput

task1 = Task(
    TextTaskInput("Identify requirements for building a blogging website about the environment"),
    text_generator_gemini,
    log=True
)

task2 = Task(
    TextTaskInput("Generate the website description and theme details from the requirements"),
    ux_designer_openai,
    log=True
)

task3 = Task(
    TextTaskInput("Generate short image description for image model"),
    image_desc_creator_openai,
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
    text_generator_gemini,
    log=True
)
```

#### Step 4: Orchestrating the Flow

With agents and tasks defined, the next step is to create and execute a flow. The flow orchestrates task execution, managing dependencies and ensuring tasks are executed asynchronously where possible.

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

To generate a visual graph for the flow:

```python
flow.generate_graph_img(name='content_flow_graph', save_path='./temp')
```

<img src="https://raw.githubusercontent.com/intelligentnode/docs/804e1c5181f76694caaf1113282376a063492852/resources/flow_graph_img.png" width="750em"/>

