# repurpose.py: a Vibe Agent whose FlowSpec was written by the coding agent
import asyncio
import json
import os
import re
import sys
from pathlib import Path

from intelli.flow import VibeAgent

HERE = Path(__file__).resolve().parent
BUNDLE = HERE / "bundle"  # absolute, so the bundle loads from any working directory
LOCAL = {"baseUrl": "http://localhost:11434"}
os.environ.setdefault("OLLAMA_BASE_URL", LOCAL["baseUrl"])  # fills ${ENV:OLLAMA_BASE_URL} in the spec

INTENT = ("Turn a blog post into a 4 tweet thread, a LinkedIn post, a 3 sentence newsletter blurb "
          "and an SEO meta description under 155 characters, written in parallel on local Ollama.")
POST = (HERE / "post.md").read_text()
SOURCE_NUMBERS = set(re.findall(r"\d+(?:\.\d+)?", POST))


def new_numbers(text):
    return sorted(set(re.findall(r"\d+(?:\.\d+)?", text)) - SOURCE_NUMBERS - {"1", "2", "3", "4"})


def flag_new_numbers(text):
    extra = new_numbers(str(text))
    return f"{text}\n\n[check] numbers not in the post: {', '.join(extra)}" if extra else text


def check_meta(text):
    text = str(text).strip().strip('"')
    notes = ([f"too long ({len(text)} chars)"] if len(text) > 155 else []) + new_numbers(text)
    return text + (f"\n\n[check] {', '.join(notes)}" if notes else "")


PROCESSORS = {"flag_new_numbers": flag_new_numbers, "check_meta": check_meta}


def assert_local_only(flow):
    """Refuse to run a flow that would call anything but local Ollama."""
    for name, task in flow.tasks.items():
        base = str((task.agent.options or {}).get("baseUrl", ""))
        if task.agent.provider != "vllm" or not base.startswith(LOCAL["baseUrl"]):
            raise ValueError(f"task {name!r} is not local: {task.agent.provider} {base}")


def coding_agent_planner(system_prompt, user_prompt):
    """planner_fn: Claude Code or Codex already wrote the spec, so no model plans here."""
    return json.loads((HERE / "repurpose_flowspec.json").read_text())


async def build_once():
    va = VibeAgent(planner_provider="vllm", planner_model="qwen2.5:0.5b", planner_options=LOCAL,
                   planner_fn=coding_agent_planner, processors=PROCESSORS)
    flow = await va.build(INTENT, save_dir=str(BUNDLE))  # validates, builds and saves the bundle
    assert_local_only(flow)


async def run_saved(post):
    # a fresh agent with no planning step; processors are not saved, so register them again
    runner = VibeAgent(planner_provider="vllm", planner_options=LOCAL, processors=PROCESSORS)
    flow = runner.build_from_spec(runner.load_bundle(str(BUNDLE / "vibeflow_bundle.json")))
    assert_local_only(flow)
    out = await flow.start(initial_input=post, max_workers=4)
    if flow.errors:
        raise RuntimeError(flow.errors)
    return {name: str(out[name]["output"]).strip() for name in ("thread", "linkedin", "newsletter", "meta")}


if __name__ == "__main__":
    if "--build" in sys.argv:
        asyncio.run(build_once())
    for name, text in asyncio.run(run_saved(POST)).items():
        print(f"## {name}\n\n{text}\n")
