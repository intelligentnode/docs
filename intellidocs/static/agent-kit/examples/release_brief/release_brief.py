"""Weekly release brief.

Paste the week's commit messages into commits.txt (one per line), then run:

    ./.venv/bin/python release_brief.py

Three writers (features, fixes, risks) work at the same time on a local model,
then an editor step writes a headline and puts the three sections into one brief.
Output: brief.md and release_brief_graph.png (the picture of the flow).

The local model is very small, so the tool does the sorting itself with simple
keyword rules (sort_commit) and checks every sentence the model writes
(faithful). A sentence that drifts away from its commit message is replaced by
the original wording, so the brief does not say things the commits did not say.
"""

import asyncio
import os
import re
import sys
import time
from pathlib import Path

from intelli.flow import Agent, Flow, Task, TextTaskInput

PROVIDER = "vllm"                      # local, no key (Ollama)
MODEL = "qwen2.5:0.5b"
OLLAMA_URL = "http://localhost:11434"
HERE = Path(__file__).resolve().parent
DEBUG = os.environ.get("BRIEF_DEBUG") == "1"   # BRIEF_DEBUG=1 prints every prompt and raw answer

TITLES = {"features": "New features", "fixes": "Fixes", "risks": "Risks"}
NONE = "- None this week."

# ---------- sorting rules (plain code, no model) ----------

PREFIX = re.compile(r"^\s*(?:[-*]\s*)?(\w+)(?:\([^)]*\))?(!)?:\s*(.+)$")
INTERNAL = {"docs", "chore", "test", "tests", "ci", "build", "style", "refactor"}
RISK_WORDS = re.compile(
    r"breaking|\bremov|deprecat|migrat|maintenance|downtime|no longer|\bmust\b|\bchanged\b|incompatib", re.I)
FIX_WORDS = re.compile(r"\b(fix|fixes|fixed|bug|crash|crashed|error|wrong|broken|faster|slow)\b", re.I)
FEATURE_WORDS = re.compile(r"\b(add|adds|added|new|introduce|introduces|support|supports|enable|allow)\b", re.I)


def sort_commit(line):
    """Return (section, text). section is 'features', 'fixes', 'risks' or None (internal work)."""
    match = PREFIX.match(line)
    kind, bang, text = (match.group(1).lower(), match.group(2), match.group(3)) if match else ("", None, line.strip())
    if bang or kind == "breaking" or RISK_WORDS.search(line):
        return "risks", text
    if kind in ("fix", "bug", "bugfix", "hotfix", "perf"):
        return "fixes", text
    if kind in ("feat", "feature"):
        return "features", text
    if kind in INTERNAL:
        return None, text
    if FIX_WORDS.search(line):
        return "fixes", text
    if FEATURE_WORDS.search(line):
        return "features", text
    return None, text


def commit_lines(text):
    return [line.strip() for line in str(text).splitlines() if line.strip()]


# ---------- checking what the model wrote (plain code, no model) ----------

FILLER = set("""fixed users user customers customer which with your that this from have will been were when
they them their there also into more than then other about after before during version requires need needs
must should using between""".split())


def stems(text):
    """The meaningful words of a text, cut to four letters so 'moved' matches 'move'."""
    return {word[:4] for word in re.findall(r"[a-z]+", text.lower()) if len(word) >= 4 and word not in FILLER}


def faithful(sentence, source, extra=1):
    """True when the sentence talks about the source and adds at most `extra` words of its own."""
    said, facts = stems(sentence), stems(source)
    return (len(said & facts) >= min(2, len(facts))
            and len(said - facts) <= extra
            and set(re.findall(r"\d+", sentence)) <= set(re.findall(r"\d+", source))
            and len(sentence.split()) <= 30)


def as_sentence(text):
    text = text.strip().rstrip(".")
    return text[:1].upper() + text[1:] + "."


def show(kind, name, text):
    if DEBUG:
        print(f"\n----- {kind} step '{name}' -----\n{text}\n-----")


# ---------- the steps ----------

SECTION_PROMPT = """Rewrite each numbered item as one short sentence for customers.
%(ask)s
Use plain words. Keep the same numbers and the same order. Do not add facts.

Items:
{items}

Sentences:"""


class Section:
    """One section writer: picks its commits, builds the exact prompt, checks the answer."""

    def __init__(self, name, ask, must_say, original, collected):
        self.name, self.ask, self.collected = name, ask, collected
        self.must_say = must_say          # the sentence must match this, or it is not trusted
        self.original = original          # how to show the original wording instead
        self.items, self.kept_original = [], 0

    def apply_input(self, data):                      # used as the task template
        self.items = [text for section, text in map(sort_commit, commit_lines(data)) if section == self.name]
        listing = "\n".join(f"{n}. {text}" for n, text in enumerate(self.items, 1)) or "(none)"
        prompt = (SECTION_PROMPT % {"ask": self.ask}).replace("{items}", listing)
        show("prompt sent by", self.name, prompt)
        return prompt

    def apply_output(self, data):
        return data

    def finish(self, output):                         # used as post_process
        show("raw answer from", self.name, output)
        written = [re.sub(r"^[\s\-*•\d.)]+", "", line).strip() for line in str(output or "").splitlines()]
        written = [line for line in written if line and not line.endswith(":")]
        bullets = []
        for position, item in enumerate(self.items):
            sentence = written[position] if position < len(written) else ""
            if not (faithful(sentence, item) and re.search(self.must_say, sentence, re.I)):
                sentence, self.kept_original = self.original(item), self.kept_original + 1
            sentence = re.sub(r"^Fixed:\s*(?=.*\bfaster\b)", "", sentence, flags=re.I)   # faster is not a repair
            bullets.append(as_sentence(sentence))
        self.collected[self.name] = bullets
        return "\n".join("- " + bullet for bullet in bullets) or NONE


HEADLINE_PROMPT = """This is the top news of this week's product release:

{news}

Write one headline for customers about this news, at most 10 words.
Output only the headline."""


class Editor:
    """The final step: the model writes the headline, code lays out the brief under it."""

    def __init__(self, collected):
        self.collected, self.news, self.headline_by_model = collected, "", False

    def apply_input(self, data):
        # data holds the three finished sections. The headline is about the first
        # new feature (or the first fix when there is no feature).
        candidates = self.collected.get("features") or self.collected.get("fixes") or self.collected.get("risks") or []
        self.news = candidates[0] if candidates else ""
        prompt = HEADLINE_PROMPT.replace("{news}", self.news or "(nothing new this week)")
        show("sections received by", "brief", data)
        show("prompt sent by", "brief", prompt)
        return prompt

    def apply_output(self, data):
        return data

    def finish(self, output):
        show("raw answer from", "brief", output)
        headline = "This week's release"
        for line in str(output or "").splitlines():
            line = re.sub(r"^(headline|title)\s*:\s*", "", line.strip(" -#*\"'"), flags=re.I).strip(" -#*\"'.")
            if line:
                if 2 <= len(line.split()) <= 12 and faithful(line, self.news, extra=3):   # headlines may add colour
                    headline, self.headline_by_model = line, True
                break
        count = {name: len(self.collected.get(name, [])) for name in TITLES}
        parts = [f"# {headline}",
                 f"This week: {count['features']} new features, {count['fixes']} fixes "
                 f"and {count['risks']} risks to know about."]
        for name, title in TITLES.items():
            bullets = "\n".join("- " + b for b in self.collected.get(name, [])) or NONE
            parts.append(f"## {title}\n{bullets}")
        return "\n\n".join(parts) + "\n"


def local_agent(mission, max_tokens):
    return Agent(
        "text",
        PROVIDER,
        mission,
        {"model": MODEL, "temperature": 0.2, "max_tokens": max_tokens},
        options={"baseUrl": OLLAMA_URL},
    )


def build_flow():
    collected = {}
    writers = {
        "features": Section(
            "features", 'Start every sentence with "You can now".',
            must_say=r"\b(now|new)\b", original=lambda item: "New: " + item, collected=collected),
        "fixes": Section(
            "fixes", 'Start every sentence with "Fixed:" and then name the problem that is gone.',
            must_say=r"\b(fixed|now|no longer|faster)\b",
            original=lambda item: item if re.search(r"faster|quicker", item, re.I) else "Fixed: " + item,
            collected=collected),
        "risks": Section(
            "risks", 'Start every sentence with "We" and say what we changed and what customers should expect or do.',
            must_say=r"^we\b", original=lambda item: "Heads-up: " + item, collected=collected),
    }
    editor = Editor(collected)
    tasks = {
        "features": Task(
            TextTaskInput("Write the new features section from the commit messages"),
            local_agent("You write the new features section of a customer release brief.", 250),
            template=writers["features"], post_process=writers["features"].finish),
        "fixes": Task(
            TextTaskInput("Write the fixes section from the commit messages"),
            local_agent("You write the fixes section of a customer release brief.", 250),
            template=writers["fixes"], post_process=writers["fixes"].finish),
        "risks": Task(
            TextTaskInput("Write the risks section from the commit messages"),
            local_agent("You write the risks section of a customer release brief.", 250),
            template=writers["risks"], post_process=writers["risks"].finish),
        "brief": Task(
            TextTaskInput("Write a headline and combine the three sections into one brief"),
            local_agent("You are a release editor. Synthesize the release news into one headline.", 60),
            template=editor, post_process=editor.finish),
    }
    flow = Flow(tasks=tasks, map_paths={"features": ["brief"], "fixes": ["brief"], "risks": ["brief"]})
    return flow, writers, editor


async def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "commits.txt"
    commits = source.read_text(encoding="utf-8").strip()
    if not commits:
        raise SystemExit(f"{source} is empty. Paste the week's commit messages into it.")
    lines = commit_lines(commits)
    print(f"Read {len(lines)} commit messages from {source.name}")
    for line in lines:
        if sort_commit(line)[0] is None:
            print(f"left out (internal work): {line}")

    flow, writers, editor = build_flow()

    # Safety check: every step must run on the local model, never on a paid service.
    for name, task in flow.tasks.items():
        if task.agent.provider != PROVIDER:
            raise RuntimeError(f"Step '{name}' would use '{task.agent.provider}', expected '{PROVIDER}'.")
        print(f"step {name:<9} provider={task.agent.provider} model={MODEL}")

    started = time.perf_counter()
    out = await flow.start(initial_input=commits, max_workers=4)
    seconds = time.perf_counter() - started

    print(f"flow.errors = {flow.errors}")
    if flow.errors:
        raise RuntimeError(f"The flow reported errors: {flow.errors}")

    for name, writer in writers.items():
        total = len(writer.items)
        print(f"{name}: {total} items, {total - writer.kept_original} rewritten by the model, "
              f"{writer.kept_original} kept in the original wording")
    print("headline: " + ("written by the model" if editor.headline_by_model else "standard headline (model's was rejected)"))

    brief_text = out["brief"]["output"]
    brief_path = HERE / "brief.md"
    brief_path.write_text(brief_text, encoding="utf-8")
    print(f"\n===== brief.md =====\n{brief_text}")

    picture = flow.generate_graph_img(name="release_brief_graph", save_path=str(HERE), show_legend=False)
    print(f"Saved brief:   {brief_path}")
    print(f"Saved picture: {picture}")
    print(f"Runtime: {seconds:.1f} seconds")


if __name__ == "__main__":
    asyncio.run(main())
