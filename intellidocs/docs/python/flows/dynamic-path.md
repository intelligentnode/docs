---
sidebar_position: 8
---
# Dynamic Path

Dynamic paths enable your workflows to make intelligent routing decisions at runtime. It adapt your workflow based on the actual outputs being processed.

## Components

The dynamic path system is built on these key components:

- **DynamicConnector**: The core class that defines routing logic and possible destinations.
- **Decision Functions**: Functions that analyze output and determine the next step.
- **Utility Helpers**: Pre-built routing functions for common scenarios.

## Parameters

When creating a `DynamicConnector`, you need to provide these parameters:

- **decision_fn**: Function that takes `(output, output_type)` and returns a destination key.
- **destinations**: Dictionary mapping destination keys to task names (maximum 4 destinations).
- **name** (optional): Name of the connector for visualization and logging.
- **mode** (optional): ConnectorMode enum value for visualization purposes.

## Built-in Routing Utilities

The framework provides several pre-built routing utilities in `intelli.flow.utils.dynamic_utils`:

- **text_length_router**: Routes based on text length thresholds.
- **text_content_router**: Routes based on keyword matches in content.
- **sentiment_router**: Routes based on positive/negative/neutral sentiment.
- **error_router**: Routes differently when errors are detected.
- **type_router**: Routes based on output data type.
- **data_exists_router**: Routes based on whether data exists or is empty.
- **custom_router**: Creates routes based on any custom condition function.

## Example: Length-Based Routing

This example routes content to different processors based on its length:

![Dynamic Workflow](https://raw.githubusercontent.com/intelligentnode/Intelli/refs/heads/main/assets/samples/length_based_routing.png)

```python
from intelli.flow import Agent, Task, Flow, TextTaskInput
from intelli.flow.types import AgentTypes
from intelli.flow.dynamic_connector import DynamicConnector, ConnectorMode
from intelli.flow.utils.dynamic_utils import text_length_router

# Define all tasks
query_task = Task(
    TextTaskInput("Write about dynamic routing in AI systems."),
    Agent(
        agent_type=AgentTypes.TEXT.value,
        provider="anthropic",
        mission="Generate text of varying length",
        model_params={"key": ANTHROPIC_API_KEY, "model": "claude-3-7-sonnet-20250219"},
    ),
    log=True,
)

short_task = Task(
    TextTaskInput("Summarize this short text in one sentence:"),
    Agent(
        agent_type=AgentTypes.TEXT.value,
        provider="openai",
        mission="Process short text",
        model_params={"key": OPENAI_API_KEY, "model": "gpt-4o"},
    ),
    log=True,
)

medium_task = Task(
    TextTaskInput("Extract the main points from this text:"),
    Agent(
        agent_type=AgentTypes.TEXT.value,
        provider="openai",
        mission="Process medium text",
        model_params={"key": OPENAI_API_KEY, "model": "gpt-4o"},
    ),
    log=True,
)

long_task = Task(
    TextTaskInput("Create a detailed analysis of this comprehensive text:"),
    Agent(
        agent_type=AgentTypes.TEXT.value,
        provider="openai",
        mission="Process long text",
        model_params={"key": OPENAI_API_KEY, "model": "gpt-4o"},
    ),
    log=True,
)

# Collect all tasks
tasks = {
    "query": query_task,
    "short_processor": short_task,
    "medium_processor": medium_task,
    "long_processor": long_task,
}

# Define length router function
def length_router(output, output_type):
    return text_length_router(
        output, output_type, [100, 200], ["short", "medium", "long"]
    )

# Define all connections
map_paths = {}  # No static connections in this example
    
dynamic_connectors = {
    "query": DynamicConnector(
        decision_fn=length_router,
        destinations={
            "short": "short_processor",    # If text length <= 100
            "medium": "medium_processor",  # If 100 < text length <= 200
            "long": "long_processor",      # If text length > 200
        },
        name="length_router",
        description="Routes based on text length",
        mode=ConnectorMode.LENGTH_BASED,
    )
}

# Create and run the flow
flow = Flow(
    tasks=tasks,
    map_paths=map_paths,
    dynamic_connectors=dynamic_connectors,
    log=True,
)

# Generate flow visualization
flow.generate_graph_img(name="length_based_routing", save_path="./temp")

# Execute the flow (in an async context)
results = await flow.start(max_workers=3)
```

## Example: Complex Workflow

This example demonstrates a more complex workflow with both static and dynamic connections:

![Complex Workflow](https://raw.githubusercontent.com/intelligentnode/Intelli/refs/heads/main/assets/samples/complex_workflow.png)

```python
from intelli.flow import Agent, Task, Flow, TextTaskInput
from intelli.flow.types import AgentTypes
from intelli.flow.dynamic_connector import DynamicConnector, ConnectorMode

# Define all tasks
initial_task = Task(
    TextTaskInput("Create a detailed explanation of a complex technical topic."),
    Agent(
        agent_type=AgentTypes.TEXT.value,
        provider="openai",
        mission="Generate initial content",
        model_params={"key": OPENAI_API_KEY, "model": "gpt-4o"},
    ),
    log=True,
)

analyzer_task = Task(
    TextTaskInput("Analyze if this content is too complex for a beginner:"),
    Agent(
        agent_type=AgentTypes.TEXT.value,
        provider="openai",
        mission="Analyze content complexity",
        model_params={"key": OPENAI_API_KEY, "model": "gpt-4o"},
    ),
    log=True,
)

simplifier_task = Task(
    TextTaskInput("Simplify this complex content for beginners:"),
    Agent(
        agent_type=AgentTypes.TEXT.value,
        provider="openai",
        mission="Simplify complex content",
        model_params={"key": OPENAI_API_KEY, "model": "gpt-4o"},
    ),
    log=True,
)

expander_task = Task(
    TextTaskInput("Expand on this topic with more details and examples:"),
    Agent(
        agent_type=AgentTypes.TEXT.value,
        provider="openai",
        mission="Expand on the topic",
        model_params={"key": OPENAI_API_KEY, "model": "gpt-4o"},
    ),
    log=True,
)

formatter_task = Task(
    TextTaskInput("Format this content nicely with markdown:"),
    Agent(
        agent_type=AgentTypes.TEXT.value,
        provider="mistral",
        mission="Format content",
        model_params={"key": MISTRAL_API_KEY, "model": "mistral-medium"},
    ),
    log=True,
)

# Collect all tasks
tasks = {
    "initial_query": initial_task,
    "complexity_analyzer": analyzer_task,
    "simplifier": simplifier_task,
    "expander": expander_task,
    "formatter": formatter_task,
}

# Define complexity router function
def complexity_router(output, output_type):
    if output_type != "text":
        return "expand"  # Default
    
    # Check if the analysis suggests simplification
    output_lower = output.lower()
    if any(term in output_lower for term in [
        "complex", "difficult", "advanced", "simplify", "too technical"
    ]):
        return "simplify"
    else:
        return "expand"

# Define all connections
map_paths = {
    # Static connections
    "initial_query": ["complexity_analyzer"],
    "simplifier": ["formatter"],
    "expander": ["formatter"],
}

dynamic_connectors = {
    # Dynamic connections
    "complexity_analyzer": DynamicConnector(
        decision_fn=complexity_router,
        destinations={
            "simplify": "simplifier",
            "expand": "expander",
        },
        name="complexity_router",
        description="Routes based on content complexity",
        mode=ConnectorMode.CONTENT_BASED,
    )
}

# Create and run the flow
flow = Flow(
    tasks=tasks,
    map_paths=map_paths,
    dynamic_connectors=dynamic_connectors,
    log=True,
)

# Generate flow visualization
flow.generate_graph_img(name="complex_workflow", save_path="./temp")

# Execute the flow (in an async context)
results = await flow.start(max_workers=3)
```

