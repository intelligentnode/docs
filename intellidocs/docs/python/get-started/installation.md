---
sidebar_position: 2
---

# Installation

## System Requirements
- Python 3.6+.
- pip (Python package installer).

##  Installation Methods
1. Using pip (Recommended):
```bash
pip install intelli
```
This downloads and installs the latest stable version along with dependencies.

2. From Source:

Clone the Intelli repository.

```bash
git clone https://github.com/intelligentnode/Intelli.git
```

## Importing
To use the library:
```python
import intelli
```

To use the chatbot:
```python
from intelli.model.input.chatbot_input import ChatModelInput
from intelli.function.chatbot import Chatbot
```

To use the flow for multiple models interaction:
```python
from intelli.flow.agents import Agent
from intelli.flow.tasks import Task
from intelli.flow.flow import Flow
```

