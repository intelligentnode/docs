"""Support ticket triage with Intelli, on OpenAI, Claude or a local model.

For each ticket, three steps run in parallel (category, urgency, summary).
A fourth step collects the three answers on one triage card and picks the path:
high urgency tickets get an escalation note for the on-call engineer;
every other ticket gets a drafted customer reply.

Run:  python triage.py
Out:  triage.md (the report) and triage_graph.png (the flow picture)

Start with one cloud key, then move offline when you want to:
  OPENAI_API_KEY set     -> runs on OpenAI (the default when this key is set)
  ANTHROPIC_API_KEY set  -> runs on Claude
  TRIAGE_PROVIDER=vllm   -> runs on a local server such as Ollama or vLLM, no key needed
TRIAGE_MODEL picks another model on the same provider.
"""
import asyncio
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

from intelli.flow import Agent, Task, TextTaskInput, Flow, DynamicConnector, Memory

HERE = Path(__file__).resolve().parent
KEY_NAMES = {"openai": "OPENAI_API_KEY", "anthropic": "ANTHROPIC_API_KEY"}
DEFAULT_MODELS = {"openai": "gpt-4.1-mini", "anthropic": "claude-haiku-4-5", "vllm": "qwen2.5:0.5b"}
# "vllm" is Intelli's provider for local OpenAI-style servers such as Ollama.
PROVIDER = os.environ.get("TRIAGE_PROVIDER") or next(
    (name for name, key in KEY_NAMES.items() if os.environ.get(key)), "vllm")
if PROVIDER not in DEFAULT_MODELS:
    raise SystemExit(f"TRIAGE_PROVIDER must be one of {sorted(DEFAULT_MODELS)}, not '{PROVIDER}'.")
MODEL = os.environ.get("TRIAGE_MODEL", DEFAULT_MODELS[PROVIDER])
BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
WHERE = (f"a local model through {BASE_URL}. No cloud service was called" if PROVIDER == "vllm"
         else f"the {PROVIDER} API")
DEBUG = os.environ.get("TRIAGE_DEBUG") == "1"

CATEGORIES = ["billing", "bug", "account", "feature"]
URGENCIES = ["high", "medium", "low"]
UNCLEAR = "unclear"

CATEGORY_PROMPT = '''Support ticket:
"""{input}"""

Which category fits this ticket best?
- billing: charges, invoices, payments, refunds
- bug: something is broken, shows an error or crashes
- account: login, password, access or account security
- feature: a request for something new

Answer with one word only: billing, bug, account or feature.'''

# The tiny local model rates urgency badly when asked for high, medium or low directly.
# It does better picking a plain description, which clean_urgency then maps to a level.
URGENCY_PROMPT = '''Support ticket:
"""{input}"""

Which sentence describes this ticket best?
- suggestion: the customer shares an idea or a small annoyance and can keep working
- problem: one customer has a problem and needs help
- emergency: a whole team cannot work, or an account was hacked

Answer with one word only: suggestion, problem or emergency.'''

SUMMARY_PROMPT = '''Support ticket:
"""{input}"""

Summarize this ticket in one short sentence of at most 20 words. Reply with the sentence only.'''

CARD_PROMPT = 'Three triage results are ready. Reply with the single word: ok'

ESCALATION_PROMPT = '''An urgent support ticket needs the on-call engineer.

Ticket {id} from {from}:
"""{ticket}"""

Triage card from the earlier steps:
{input}

Write a short escalation note addressed to the on-call engineer, not to the customer. Use 3 to 5 lines: what is wrong, who is affected, and the first thing to check. Plain text only.'''

REPLY_PROMPT = '''A customer sent this support ticket.

Ticket {id} from {from}:
"""{ticket}"""

Triage card from the earlier steps:
{input}

Write a short, polite reply to the customer, 3 to 5 sentences: thank them, say what you understood, and say what happens next. Do not promise a date. Plain text only.'''


class Prompt:
    """Exact prompt for a step. {input} is what the flow hands to the step."""

    def __init__(self, text, ticket=None, label=""):
        self.text = text
        self.ticket = ticket or {}
        self.label = label

    def apply_input(self, data):
        prompt = self.text
        for key, value in (("{id}", self.ticket.get("id", "")),
                           ("{from}", self.ticket.get("from", "")),
                           ("{ticket}", self.ticket.get("text", "")),
                           ("{input}", str(data))):
            prompt = prompt.replace(key, value)
        if DEBUG:
            print(f"\n--- prompt for {self.label} ---\n{prompt}\n--- end ---", file=sys.stderr)
        return prompt


def pick_label(words):
    """Turn a model answer into a label. `words` maps what the model may say to the label."""
    def clean(output):
        text = str(output).lower()
        found = [(text.find(word), label) for word, label in words.items() if word in text]
        return min(found)[1] if found else UNCLEAR
    return clean


clean_category = pick_label({name: name for name in CATEGORIES})
clean_urgency = pick_label({"emergency": "high", "problem": "medium", "suggestion": "low",
                            **{name: name for name in URGENCIES}})


def one_line(output):
    lines = [ln.strip(' "\t') for ln in str(output).splitlines() if ln.strip(' "\t')]
    return (lines[0] if lines else "(no summary)")[:200]


def tidy(output):
    return str(output).strip()


def route_by_urgency(output, output_type):
    """Read the triage card and pick the path."""
    return "high" if "urgency: high" in str(output).lower() else "other"


def step_agent(mission, max_tokens, temperature):
    """One agent per step, on the provider chosen above."""
    # temperature 0 for labels: at 0.1 the small local model flipped an outage between "high" and "medium"
    if PROVIDER == "vllm":
        return Agent("text", PROVIDER, mission,
                     {"model": MODEL, "temperature": temperature, "max_tokens": max_tokens},
                     options={"baseUrl": BASE_URL})
    key = os.environ.get(KEY_NAMES[PROVIDER])
    if not key:
        raise SystemExit(f"Set {KEY_NAMES[PROVIDER]} to run on {PROVIDER}, "
                         f"or set TRIAGE_PROVIDER=vllm to run on a local model.")
    # hosted models get more room: some spend part of the budget before they answer
    return Agent("text", PROVIDER, mission,
                 {"key": key, "model": MODEL, "temperature": temperature, "max_tokens": max(max_tokens, 256)})


def build_flow(ticket):
    memory = Memory()

    def make_card(_model_text):
        # The card is built by fixed rules from the three saved answers, not by the model.
        return (f"Category: {clean_category(memory.retrieve('category'))}\n"
                f"Urgency: {clean_urgency(memory.retrieve('urgency'))}\n"
                f"Summary: {one_line(memory.retrieve('summary'))}")

    tasks = {
        "category": Task(TextTaskInput("Pick the ticket category"),
                         step_agent("You label support tickets with one category.", 8, 0),
                         template=Prompt(CATEGORY_PROMPT, label="category"),
                         post_process=clean_category),
        "urgency": Task(TextTaskInput("Rate the ticket urgency"),
                        step_agent("You rate how urgent support tickets are.", 8, 0),
                        template=Prompt(URGENCY_PROMPT, label="urgency"),
                        post_process=clean_urgency),
        "summary": Task(TextTaskInput("Summarize the ticket in one line"),
                        step_agent("You summarize support tickets in one line.", 60, 0.2),
                        template=Prompt(SUMMARY_PROMPT, label="summary"),
                        post_process=one_line),
        "triage_card": Task(TextTaskInput("Collect the three answers on one triage card"),
                            step_agent("You confirm that the triage results arrived.", 2, 0),
                            template=Prompt(CARD_PROMPT, label="triage_card"),
                            post_process=make_card),
        "escalation_note": Task(TextTaskInput("Write an escalation note for the on-call engineer"),
                                step_agent("You write short escalation notes for on-call engineers.",
                                      320, 0.3),
                                template=Prompt(ESCALATION_PROMPT, ticket, "escalation_note"),
                                post_process=tidy),
        "customer_reply": Task(TextTaskInput("Draft a reply to the customer"),
                               step_agent("You write short, polite replies to customers.", 320, 0.3),
                               template=Prompt(REPLY_PROMPT, ticket, "customer_reply"),
                               post_process=tidy),
    }
    flow = Flow(
        tasks=tasks,
        # the three parallel steps all feed the triage card
        map_paths={"category": ["triage_card"],
                   "urgency": ["triage_card"],
                   "summary": ["triage_card"]},
        # the triage card decides which final step runs
        dynamic_connectors={"triage_card": DynamicConnector(
            decision_fn=route_by_urgency,
            destinations={"high": "escalation_note", "other": "customer_reply"})},
        # keep each answer so the card can be built from them
        output_memory_map={"category": "category", "urgency": "urgency", "summary": "summary"},
        memory=memory,
    )
    for name, task in flow.tasks.items():
        if task.agent.provider != PROVIDER:
            raise RuntimeError(f"Step '{name}' uses provider '{task.agent.provider}', "
                               f"expected '{PROVIDER}'.")
    return flow


async def triage_ticket(ticket):
    flow = build_flow(ticket)
    out = await flow.start(initial_input=ticket["text"], max_workers=4)
    if flow.errors:
        raise RuntimeError(f"Ticket {ticket['id']}: flow errors {flow.errors}")
    if DEBUG:
        print(f"steps that ran for {ticket['id']}: {sorted(out)}", file=sys.stderr)

    urgency = out["urgency"]["output"]
    ran_note, ran_reply = "escalation_note" in out, "customer_reply" in out
    if ran_note == ran_reply:
        raise RuntimeError(f"Ticket {ticket['id']}: expected exactly one final step, "
                           f"got {sorted(out)}")
    if ran_note != (urgency == "high"):
        raise RuntimeError(f"Ticket {ticket['id']}: urgency '{urgency}' went to the wrong step")

    return {
        **ticket,
        "category": out["category"]["output"],
        "urgency": urgency,
        "summary": out["summary"]["output"],
        "route": "escalation note" if ran_note else "customer reply",
        "final_text": out["escalation_note" if ran_note else "customer_reply"]["output"],
    }


def write_report(results, seconds, picture):
    def cell(text):
        return str(text).replace("|", "/").replace("\n", " ")

    def quote(text):
        return "\n".join("> " + line for line in str(text).splitlines())

    escalated = [r for r in results if r["route"] == "escalation note"]
    unclear = [r["id"] for r in results if UNCLEAR in (r["category"], r["urgency"])]
    checked = [r for r in results if r.get("expected")]
    cat_ok = sum(r["category"] == r["expected"]["category"] for r in checked)
    urg_ok = sum(r["urgency"] == r["expected"]["urgency"] for r in checked)

    lines = [
        "# Support ticket triage report",
        "",
        f"- Run: {datetime.now():%Y-%m-%d %H:%M}, {seconds:.0f} seconds for {len(results)} tickets",
        f"- Model: {MODEL}, running on {WHERE}.",
        f"- Escalated to the on-call engineer: {len(escalated)}. Customer replies drafted: "
        f"{len(results) - len(escalated)}.",
        f"- Flow picture: {Path(picture).name}",
        "",
        "## Overview",
        "",
        "| Ticket | Category | Urgency | Next step | One line summary |",
        "| --- | --- | --- | --- | --- |",
    ]
    for r in results:
        lines.append(f"| {r['id']} | {r['category']} | {r['urgency']} | {r['route']} | {cell(r['summary'])} |")

    lines += ["", "## Check against the expected labels", ""]
    if checked:
        lines += [
            f"The sample tickets carry the labels a person would give. The model agreed on "
            f"{cat_ok} of {len(checked)} categories and {urg_ok} of {len(checked)} urgency ratings.",
            "The wording of the questions was adjusted on these same six tickets, so expect more "
            "mistakes on real tickets with this very small model.",
            "",
            "| Ticket | Category (model / expected) | Urgency (model / expected) |",
            "| --- | --- | --- |",
        ]
        for r in checked:
            c = "ok" if r["category"] == r["expected"]["category"] else "DIFFERENT"
            u = "ok" if r["urgency"] == r["expected"]["urgency"] else "DIFFERENT"
            lines.append(f"| {r['id']} | {r['category']} / {r['expected']['category']} ({c}) | "
                         f"{r['urgency']} / {r['expected']['urgency']} ({u}) |")
    if unclear:
        lines += ["", f"Needs a human look (the model did not give a usable label): {', '.join(unclear)}."]

    lines += ["", "## Tickets", ""]
    for r in results:
        title = "Escalation note for the on-call engineer" if r["route"] == "escalation note" \
            else "Drafted customer reply"
        lines += [
            f"### {r['id']} from {r['from']}",
            "",
            quote(r["text"]),
            "",
            f"- Category: {r['category']}",
            f"- Urgency: {r['urgency']}",
            f"- Summary: {r['summary']}",
            "",
            f"**{title}**",
            "",
            quote(r["final_text"]),
            "",
        ]
    path = HERE / "triage.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


async def main():
    tickets = json.loads((HERE / "tickets.json").read_text(encoding="utf-8"))
    picture = build_flow(tickets[0]).generate_graph_img(
        name="triage_graph", save_path=str(HERE), show_legend=False)

    started = time.time()
    results = []
    for ticket in tickets:
        result = await triage_ticket(ticket)
        results.append(result)
        print(f"{result['id']}  category={result['category']:<8} urgency={result['urgency']:<7} "
              f"-> {result['route']:<15} | {result['summary'][:70]}")
    seconds = time.time() - started

    report = write_report(results, seconds, picture)
    print(f"\n{len(results)} tickets triaged in {seconds:.0f}s on {MODEL} ({PROVIDER}). flow.errors: none")
    print(f"Report:  {report}")
    print(f"Picture: {picture}")


if __name__ == "__main__":
    asyncio.run(main())
