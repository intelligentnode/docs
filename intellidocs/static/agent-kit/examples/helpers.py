# helpers.py: every agent talks to local Ollama, so no API key is needed
from intelli.flow import Agent

OLLAMA = {"baseUrl": "http://localhost:11434"}
MODEL = "qwen2.5:0.5b"  # change to a bigger model for real labels


def local_agent(mission, max_tokens=300, temperature=0.2):
    return Agent("text", "vllm", mission,
                 {"model": MODEL, "temperature": temperature, "max_tokens": max_tokens},
                 options=OLLAMA)


class Prompt:
    """A task template: any object with apply_input(data) works."""

    def __init__(self, text):
        self.text = text

    def apply_input(self, data):
        return self.text.replace("{input}", str(data))


# helpers.py (addition): a cloud agent for the steps customers read
import os


def claude_agent(mission, max_tokens=300):
    return Agent("text", "anthropic", mission,
                 {"key": os.environ["ANTHROPIC_API_KEY"], "model": "claude-sonnet-5", "max_tokens": max_tokens})
