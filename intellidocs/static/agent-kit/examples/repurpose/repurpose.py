"""Blog post repurposer, built with Intelli as a Vibe Agent.

A content planner step first pulls the key points out of one blog post. Four writers
then work from those points at the same time on a local model: a tweet thread, a
LinkedIn post, a newsletter blurb and a search snippet.

Usage:
    ./.venv/bin/python repurpose.py [path/to/post.md]

The first run builds the flow from the plan in repurpose_spec.json and saves it
as a bundle in ./bundle. Every later run reloads that bundle, with no planning.
"""

import asyncio
import json
import os
import re
import sys
import time
from pathlib import Path

from intelli.flow import VibeAgent

ROOT = Path(__file__).resolve().parent
SPEC_FILE = ROOT / "repurpose_spec.json"
BUNDLE_DIR = ROOT / "bundle"  # absolute, because the bundle stores the spec path as given
BUNDLE_FILE = BUNDLE_DIR / "vibeflow_bundle.json"
OUT_DIR = ROOT / "outputs"

PROVIDER = "vllm"  # local Ollama through its OpenAI compatible API
INTENT = (
    "Plan the key points of a blog post first, then turn them into a tweet thread, a LinkedIn post, "
    "a newsletter blurb and a search snippet, all written at the same time, on a local model."
)
OUTPUT_FILES = {
    "tweet_thread": "tweet_thread.md",
    "linkedin_post": "linkedin_post.md",
    "newsletter_blurb": "newsletter_blurb.md",
    "search_snippet": "search_snippet.txt",
}

NUMBER = r"\d+(?:[.,]\d+)*"


def make_processors(source):
    """Post-processors named in the spec. They must be registered on every load."""
    source_numbers = set(re.findall(NUMBER, source))
    source_flat = " ".join(source.split())

    def check_against_post(text):
        """Add a [CHECK] line when the draft has new numbers or mostly copies the post."""
        text = (text or "").strip()
        notes = []
        # Ignore list numbering such as "1/4" or "2." at the start of a line.
        body = re.sub(r"(?m)^\W*\d+\s*[/.)]\s*\d*", "", text)
        new = sorted(set(re.findall(NUMBER, body)) - source_numbers)
        if new:
            notes.append("numbers that are not in the original post: " + ", ".join(new))
        sentences = [x.strip() for x in re.split(r"(?<=[.!?])\s+", " ".join(text.split())) if len(x.strip()) > 25]
        copied = sum(1 for x in sentences if x in source_flat)
        if sentences and copied / len(sentences) >= 0.6:
            notes.append("most of this text is copied word for word from the original post")
        for note in notes:
            text += "\n\n[CHECK: " + note + "]"
        return text

    def snippet_160(text):
        line = " ".join((text or "").split()).strip('"')
        if len(line) > 160:
            line = line[:157].rsplit(" ", 1)[0] + "..."
        return check_against_post(line)

    def clean_plan(text):
        """Turn the planner's answer into key points that are real sentences from the post.

        Each line the model returns is matched to the closest sentence in the post and replaced by it,
        so a planner mistake cannot spread to the four writers. Unmatched lines are dropped. If too few
        remain, the title and the sentences that carry numbers fill the list.
        """
        plain = re.sub(r"(?m)^#+\s*", "", source)
        sentences = [x.strip() for part in plain.splitlines() for x in re.split(r"(?<=[.!?])\s+", part) if len(x.strip()) > 15]

        def words(value):
            return set(re.findall(r"[a-z0-9%]+", value.lower()))

        points = []
        for line in (text or "").splitlines():
            line = re.sub(r"^[\s\-*#\d.)]+", "", line).strip()
            if len(line) < 15:
                continue
            best = max(sentences, key=lambda sentence: len(words(line) & words(sentence)) / max(1, len(words(line) | words(sentence))))
            overlap = len(words(line) & words(best)) / max(1, len(words(line) | words(best)))
            if overlap >= 0.6 and best not in points:
                points.append(best)
        if len(points) < 3:
            for sentence in sentences[:1] + [x for x in sentences if re.search(r"\d", x)]:
                if sentence not in points:
                    points.append(sentence)
        return "\n".join("- " + point for point in points[:5])

    return {"check_against_post": check_against_post, "snippet_160": snippet_160, "clean_plan": clean_plan}


class ExactPrompt:
    """Exact prompt for one step: the instruction, then its input (the post or the key points).

    A Vibe Agent wraps each instruction in its own template, which leaves a stray
    placeholder line in the prompt. A small local model copies the post back when
    it sees that, so each step gets this template instead.
    """

    def __init__(self, instruction):
        self.instruction = instruction

    def apply_input(self, data):
        return f"{self.instruction}\n\n{data}"


async def main():
    os.chdir(ROOT)
    post_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "sample_post.md"
    source = post_path.read_text(encoding="utf-8").strip()

    # The spec holds ${ENV:OLLAMA_BASE_URL}. An unset variable would stay as literal text.
    os.environ.setdefault("OLLAMA_BASE_URL", "http://localhost:11434")

    processors = make_processors(source)
    planner_calls = 0

    if BUNDLE_FILE.exists():
        va = VibeAgent(processors=processors)
        flow = va.build_from_spec(va.load_bundle(str(BUNDLE_FILE)))
        spec = json.loads((BUNDLE_DIR / "flow_spec.json").read_text(encoding="utf-8"))
        mode = "reloaded the saved plan from " + str(BUNDLE_FILE)
    else:
        spec = json.loads(SPEC_FILE.read_text(encoding="utf-8"))

        def planner(system, user):
            nonlocal planner_calls
            planner_calls += 1
            return spec

        va = VibeAgent(planner_fn=planner, processors=processors)
        flow = await va.build(INTENT, save_dir=str(BUNDLE_DIR))
        mode = "planned from " + SPEC_FILE.name + " and saved the plan in " + str(BUNDLE_DIR)

    print("Plan:", mode)
    print("Planning calls in this run:", planner_calls)

    instructions = {t["name"]: t["desc"] for t in spec["tasks"]}
    for name, task in flow.tasks.items():
        provider = task.agent.provider
        print(f"  step {name}: provider {provider}")
        if provider != PROVIDER:
            raise SystemExit(f"Step {name} uses provider {provider!r}, expected {PROVIDER!r}. Stopping.")
        task.template = ExactPrompt(instructions[name])

    # Markdown heading marks ("# Title") make a small model copy the "#", so send plain lines.
    plain_post = re.sub(r"(?m)^#+\s*", "", source)

    started = time.time()
    out = await flow.start(initial_input=plain_post, max_workers=4)
    elapsed = time.time() - started

    print("flow.errors:", flow.errors)
    if flow.errors:
        raise SystemExit("The flow reported errors, so nothing was saved.")

    print("\n--- content_plan (key points the four writers received) ---\n" + out["content_plan"]["output"])

    OUT_DIR.mkdir(exist_ok=True)
    for name, filename in OUTPUT_FILES.items():
        text = out[name]["output"]
        (OUT_DIR / filename).write_text(text + "\n", encoding="utf-8")
        print(f"\n--- {name} -> outputs/{filename} ---\n{text}")

    picture = flow.generate_graph_img(name="repurpose_graph", save_path=".", show_legend=False)
    print(f"\nRuntime of the five steps: {elapsed:.1f} seconds")
    print("Picture:", picture)


if __name__ == "__main__":
    asyncio.run(main())
