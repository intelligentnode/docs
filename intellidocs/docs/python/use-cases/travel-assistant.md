---
sidebar_position: 2
---

# Multi Model: Travel Assistant

Let's explore a practical example: a travel assistant that plan trips by generating itineraries, creating visual previews, and providing audio guides.

### Setting Up the Environment

```python
import os
import asyncio
from dotenv import load_dotenv
from intelli.flow import Agent, KerasAgent, Task, Flow, TextTaskInput, AgentTypes

# Load environment variables
load_dotenv()

# Access API keys
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MISTRAL_KEY = os.getenv("MISTRAL_API_KEY")
STABILITY_KEY = os.getenv("STABILITY_API_KEY")
ELEVENLABS_KEY = os.getenv("ELEVENLABS_API_KEY")
```

### Creating Specialized Agents

```python
# Text generation agent for itinerary creation
itinerary_agent = Agent(
    agent_type=AgentTypes.TEXT.value,
    provider="openai",
    mission="Create a detailed travel itinerary",
    model_params={"key": OPENAI_KEY, "model": "gpt-3.5-turbo"}
)

# Speech synthesis agent for audio guides
speech_agent = Agent(
    agent_type=AgentTypes.SPEECH.value,
    provider="elevenlabs",
    mission="Convert travel information to speech",
    model_params={
        "key": ELEVENLABS_KEY,
        "voice": "Antoni",  # Replace with your preferred voice ID
        "model": "eleven_multilingual_v2"
    }
)

# Image generation agent for destination previews
image_agent = Agent(
    agent_type=AgentTypes.IMAGE.value,
    provider="stability",
    mission="Generate travel destination images",
    model_params={"key": STABILITY_KEY}
)

# Vision analysis agent for image understanding
vision_agent = Agent(
    agent_type=AgentTypes.VISION.value,
    provider="openai",
    mission="Analyze travel destination images",
    model_params={
        "key": OPENAI_KEY,
        "model": "gpt-4o",
        "extension": "png"
    }
)

# Text agent for final travel guide creation
guide_agent = Agent(
    agent_type=AgentTypes.TEXT.value,
    provider="mistral",
    mission="Create comprehensive travel guides",
    model_params={"key": MISTRAL_KEY, "model": "mistral-medium"}
)
```

### Defining Tasks

```python
# Task 1: Generate a travel itinerary
itinerary_task = Task(
    TextTaskInput(
        "Create a 3-day travel itinerary for Rome, Italy. Include major attractions, food recommendations, and transportation tips."
    ),
    itinerary_agent,
    log=True
)

# Task 2: Convert part of the itinerary to speech
speech_task = Task(
    TextTaskInput(
        "Convert the first day of this itinerary to speech for the traveler"
    ),
    speech_agent,
    log=True
)

# Task 3: Generate an image prompt for the destination
image_prompt_task = Task(
    TextTaskInput(
        "Create a short, specific image generation prompt for Rome showing the iconic Colosseum"
    ),
    itinerary_agent,
    log=True
)

# Task 4: Generate a destination image
image_task = Task(
    TextTaskInput(
        "Rome with the iconic Colosseum under clear blue sky"
    ),
    image_agent,
    log=True
)

# Task 5: Analyze the generated image
vision_task = Task(
    TextTaskInput(
        "Identify the landmarks and notable features in this image that would be relevant for a traveler"
    ),
    vision_agent,
    log=True
)

# Task 6: Create a travel guide combining all information
guide_task = Task(
    TextTaskInput(
        "Create a comprehensive travel guide for Rome by combining the itinerary and image analysis"
    ),
    guide_agent,
    log=True
)
```

### Orchestrating the Workflow

```python
async def run_travel_assistant():
    # Create the flow with task dependencies
    flow = Flow(
        tasks={
            "itinerary": itinerary_task,
            "speech": speech_task,
            "image_prompt": image_prompt_task,
            "image": image_task,
            "vision": vision_task,
            "guide": guide_task
        },
        map_paths={
            "itinerary": ["speech", "image_prompt", "guide"],
            "image_prompt": ["image"],
            "image": ["vision"],
            "vision": ["guide"],
            "guide": []
        },
        log=True
    )
    
    # Generate a visualization of the flow
    flow.generate_graph_img(
        name="travel_assistant_flow",
        save_path="./output"
    )
    
    # Execute the flow
    results = await flow.start(max_workers=3)
    
    return results

# Run the travel assistant
if __name__ == "__main__":
    results = asyncio.run(run_travel_assistant())
    print("Travel assistant workflow completed successfully!")
```

### Model Fallbacks

You can implement fallback patterns to ensure reliability:

```python
def create_text_agent():
    """Create a text agent with fallback options"""
    if os.getenv("ANTHROPIC_API_KEY"):
        return Agent(
            agent_type=AgentTypes.TEXT.value,
            provider="anthropic",
            mission="Generate detailed text content",
            model_params={"key": os.getenv("ANTHROPIC_API_KEY"), "model": "claude-3-opus-20240229"}
        )
    else:
        return Agent(
            agent_type=AgentTypes.TEXT.value,
            provider="openai",
            mission="Generate detailed text content",
            model_params={"key": os.getenv("OPENAI_API_KEY"), "model": "gpt-4"}
        )
```

### Hybrid Local/Remote Workflows

Combine cloud-based and local models for privacy and efficiency:

```python
# Cloud-based text agent
cloud_agent = Agent(
    agent_type=AgentTypes.TEXT.value,
    provider="openai",
    mission="Generate initial content",
    model_params={"key": OPENAI_KEY, "model": "gpt-3.5-turbo"}
)

# Local Keras-based agent for private processing
local_agent = KerasAgent(
    agent_type=AgentTypes.TEXT.value,
    mission="Summarize and refine content",
    model_params={"model_name": "mistral_7b_en", "max_length": 200},
    log=True
)
```
