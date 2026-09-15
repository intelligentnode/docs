---
sidebar_position: 1
---

# Installation

### System Requirements
- Python 3.10+.
- pip (Python package installer).

###  Installation Methods
1. Using pip (Recommended):
```bash
pip install intelli
```
This downloads and installs the latest stable version along with dependencies.

The extras add the optional capabilities:

```bash
pip install intelli[mcp]        # MCP servers and clients
pip install intelli[computer]   # computer use and browser agent
pip install intelli[speech]     # speech recognition providers
pip install intelli[offline]    # offline models through keras
pip install intelli[llamacpp]   # GGUF models
```

The computer use agent also needs a browser:

```bash
python -m playwright install chromium
```

2. From Source:

Clone the intelli repository.

```bash
git clone https://github.com/intelligentnode/Intelli.git
```

### Importing
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

