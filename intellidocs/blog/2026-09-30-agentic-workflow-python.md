---
slug: agentic-workflow-python
title: "Agentic Workflows in Python Without LangGraph"
description: "Build an agentic workflow in Python with chain, parallel, router, loop and MCP tool patterns, then compare Intelli flows with LangGraph and CrewAI."
keywords: ["agentic workflow python", "langgraph alternatives python", "multi agent framework python", "ai agent orchestration python", "multi agent system in python", "ai agent orchestration patterns", "python llm workflow", "intelli flow"]
tags: [{label: "Python", permalink: "/python"}, "AI Agents", "Agentic Workflows", "Orchestration"]
authors: [intellinode]
image: /img/articles/agentic-workflow-python.jpg
image_alt: "Blue and lavender ribbons of light crossing and merging from left to right, like steps in an agentic workflow"
date: 2026-09-30T10:00:00Z
---

An agentic workflow in Python is a set of model calls, tools and plain functions wired into a fixed shape: a chain, a fan-out, a router or a loop. The model makes decisions inside each step, but your code decides which steps exist. You do not need LangGraph for that. You need a graph runner, a clean handoff between steps, and a way to call different providers.

This guide builds each common AI agent orchestration pattern with Intelli, an Apache 2.0 Python library for multi-model agent flows. The examples mix OpenAI, Claude and Gemini in one flow and can run on a local Ollama model. It closes by comparing Intelli with LangGraph, CrewAI and plain code, including where each of them wins.

![Blue and lavender ribbons of light crossing and merging from left to right, like steps in an agentic workflow](/img/articles/agentic-workflow-python.jpg)

<!-- truncate -->

## Workflow or agent: how much autonomy you need

Anthropic's engineering team draws a useful line in [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents). In a workflow, models and tools follow predefined code paths. In an agent, the model directs its own process and chooses its tools. The post recommends adding autonomy only when simpler setups fall short.

For most business processes the workflow wins on cost and audits. Take a SaaS support team handling 12,000 tickets a month. A workflow that triages, extracts facts and risks in parallel, and drafts a reply makes four model calls per ticket, every time. That is 48,000 calls a month, a number finance can budget and QA can test. An autonomous agent might use 3 calls on one ticket and 25 on the next.

Fix the known steps in code and give the model freedom only inside a step. If you have not built a single tool calling agent yet, start with [How to Build an AI Agent in Python](/articles/how-to-build-ai-agent-python) and come back when one step is not enough.

## The building blocks of an agentic workflow in Python

For AI agent orchestration in Python, Intelli gives you four pieces:

- `Agent`: one model or tool, with a mission (the system prompt), a provider and model settings.
- `Task`: one unit of work for an agent, with optional `pre_process` and `post_process` hooks.
- `SequenceFlow`: runs tasks in a straight line.
- `Flow`: runs a graph of tasks. `map_paths` says which task feeds which, independent tasks run in parallel, and connectors add routing.

Each agent picks its own provider, so a cheap fast model can classify while a stronger one writes. Install with `pip install intelli`, then put the provider setup in one file so the pattern examples stay short:

```python
# providers.py
import os
from intelli.flow import Agent

def gpt(mission, **params):
    return Agent("text", "openai", mission,
                 {"key": os.environ["OPENAI_API_KEY"], "model": "gpt-5.5", **params})

def claude(mission, **params):
    return Agent("text", "anthropic", mission,
                 {"key": os.environ["ANTHROPIC_API_KEY"], "model": "claude-sonnet-5", **params})

def gemini(mission, **params):
    return Agent("text", "gemini", mission,
                 {"key": os.environ["GEMINI_API_KEY"], "model": "gemini-2.5-flash", **params})

def local(mission, **params):
    # Ollama or vLLM on your own machine: no API key, no per-token bill
    return Agent("text", "vllm", mission, {"model": "qwen2.5:0.5b", **params},
                 options={"baseUrl": "http://localhost:11434"})
```

This file is also your insurance against vendor lock-in: moving a step from Claude to Gemini is a one-word change.

## Pattern 1: the sequential chain

Anthropic's post calls this prompt chaining: each step works on the previous step's output. Here GPT writes release notes from commit messages, and Claude turns them into a two-sentence banner for the app.

```python
from intelli.flow import Task, SequenceFlow, TextTaskInput, TextProcessor
from providers import gpt, claude

commits = """feat: export invoices as CSV
fix: weekly report used the wrong timezone
perf: dashboard loads 40% faster"""

notes = Task(TextTaskInput("Write release notes for these commits, one short paragraph each."),
             gpt("You write clear release notes for B2B customers."))
banner = Task(TextTaskInput("Summarize the release notes in two sentences for an in-app banner."),
              claude("You write short product announcements."),
              pre_process=TextProcessor.text_head)  # hand off the first 800 characters only

result = SequenceFlow([notes, banner], log=True).start(initial_input=commits)
print(result["task2"])
```

Two details matter. `TextProcessor.text_head` trims the handoff to 800 characters, which caps what the second call costs. And `SequenceFlow` returns positional keys (`task1`, `task2`) with raw outputs as values, so update the code that reads them if you reorder tasks.

## Pattern 2: parallel fan-out and merge

When two steps do not depend on each other, run them at the same time. This support flow extracts facts with Gemini and churn risks with GPT in parallel, then Claude writes the reply from both.

```python
import asyncio
from intelli.flow import Task, Flow, TextTaskInput
from providers import gpt, claude, gemini

ticket = ("Order #1001 arrived with a cracked screen. This is our second damaged "
          "delivery this quarter, and our 40 seats are up for renewal in May.")

tasks = {
    "facts": Task(TextTaskInput("List the facts in this ticket as short bullets."),
                  gemini("You extract facts from support tickets.")),
    "risks": Task(TextTaskInput("List the churn risks in this ticket."),
                  gpt("You are a customer success analyst.")),
    "reply": Task(TextTaskInput("Write a short, calm reply to the customer."),
                  claude("You synthesize analyst notes into customer replies.")),
}
flow = Flow(tasks=tasks,
            map_paths={"facts": ["reply"], "risks": ["reply"]},
            output_memory_map={"reply": "final_reply"})

result = asyncio.run(flow.start(max_workers=4, initial_input=ticket))
print(result["reply"]["output"])
print(flow.errors)                        # {} when every step worked
saved = flow.memory.retrieve("final_reply")
```

`initial_input` goes to every root task, so both analysts see the ticket. The reply step waits for both parents and receives their outputs joined. Because its mission contains "synthesize", Intelli wraps each parent's output in a labeled block, so the writer can tell facts from risks. `output_memory_map` copies the reply into `flow.memory`.

`max_workers` caps how many tasks run at once, and Intelli also limits each provider to 10 concurrent tasks, which helps with rate limits. A `Flow` returns `output` and `type` for each task name. The [async flow docs](/docs/python/flows/async-flow) walk through a larger graph.

## Pattern 3: routing with a classifier

A cheap Gemini call classifies inbound email, and a `DynamicConnector` sends it to the billing, bug or sales desk. Only the chosen branch runs, so you pay for one specialist instead of three.

```python
import asyncio
from intelli.flow import Task, Flow, TextTaskInput, DynamicConnector, ConnectorMode
from intelli.flow.utils.dynamic_utils import text_content_router
from providers import gpt, claude, gemini

email = "I was charged twice for the March invoice."

triage = Task(TextTaskInput("Classify this email as billing, bug or sales. Reply with one word."),
              gemini("You triage inbound customer email."))
desks = {   # memory_key: each desk reads the email itself, not the one word label
    "billing": Task(TextTaskInput("Draft a reply about the charge."), gpt("You work on the billing desk."),
                    memory_key="email"),
    "bug": Task(TextTaskInput("Write a bug report for engineering."), claude("You are a QA lead."),
                memory_key="email"),
    "sales": Task(TextTaskInput("Draft a sales follow up."), gpt("You are an account executive."),
                  memory_key="email"),
}

def route(output, output_type):
    if str(output).startswith("Error"):
        return None   # unknown key: stop here, flow.errors has the details
    return text_content_router(output, output_type, {
        "billing": ["billing", "invoice", "charge"],   # first key is the fallback
        "bug": ["bug", "error", "crash"],
        "sales": ["sales", "pricing", "demo"],
    })

flow = Flow(
    tasks={"triage": triage, **desks},
    map_paths={},
    dynamic_connectors={"triage": DynamicConnector(
        route, {"billing": "billing", "bug": "bug", "sales": "sales"},
        name="email_triage", mode=ConnectorMode.CONTENT_BASED)},
)
flow.memory.store("email", email)
result = asyncio.run(flow.start(initial_input=email))
print(sorted(result))   # ['billing', 'triage']: only the chosen desk ran
```

A few rules that matter in production:

- A destination receives its parent's output, here the one-word label. The desks read the full email from `flow.memory` through `memory_key`.
- A connector supports at most 4 destinations. For more, route in two levels.
- `text_content_router` falls back to the first key when nothing matches, so list your safest desk first.
- An unknown key stops the branch. The `Error` check uses that on purpose: without it, a failed classifier returns text containing "error" and lands on the bug desk. We hit exactly this in testing.
- A shared step fed by all three desks never runs, because a `Flow` task waits for all of its parents. Give each branch its own follow-up step.

Length, sentiment, error and type routers are in the [dynamic path docs](/docs/python/flows/dynamic-path).

## Pattern 4: loops for self-review

Some outputs need a few passes, such as a subject line that must fit in 60 characters. `LoopTask` repeats its steps until a stop condition passes or `max_loops` is reached.

```python
import asyncio
from intelli.flow import Task, Flow, TextTaskInput, LoopTask
from providers import gpt

rewrite = Task(TextTaskInput("Rewrite this email subject line to be shorter and clearer."),
               gpt("You write email subject lines. Reply with the subject line only."))

loop = LoopTask("shorten subject", [rewrite], max_loops=4,
                stop_condition=lambda i, out, out_type, mem: len(str(out)) <= 60,
                store_history_memory_key="subject_history")

flow = Flow(tasks={"subject": loop}, map_paths={})
result = asyncio.run(flow.start(initial_input=(
    "Important information regarding upcoming changes to your monthly subscription billing cycle")))

print(result["subject"]["output"])
for step in flow.memory.retrieve("subject_history"):
    print(step["iteration"], step["output"])
```

The stop check is plain Python, which is free and deterministic. You can add a reviewer model to `steps`, but `LoopTask` returns the last step's output, so you would get the review instead of the draft. `max_loops=4` doubles as a cost ceiling.

`Flow` requires an acyclic graph and raises `ValueError` on a cycle, so repetition lives inside one node and the graph stays easy to review. The [loop docs](/docs/python/flows/loop) cover the stop condition and history.

## Pattern 5: tool calls routed to MCP servers

Here the model decides whether it needs data, and the flow runs the tool. First, a small MCP server with one tool (install the extra with `pip install "intelli[mcp]"`):

```python
# order_server.py
from intelli.mcp import MCPServerBuilder

server = MCPServerBuilder("OrderTools")

@server.add_tool
def lookup_order(order_id: str) -> str:
    """Return the shipping status of an order"""
    orders = {"A-1001": "shipped on 28 Sep, arrives Friday", "A-1002": "waiting for stock"}
    return f"Order {order_id}: {orders.get(order_id, 'not found')}"

if __name__ == "__main__":
    server.run(transport="stdio", print_info=False)  # stdout carries the MCP protocol
```

If GPT calls `lookup_order`, a `ToolDynamicConnector` routes to an MCP task that runs the tool. If it answers in text, the flow sends that answer to a direct step.

```python
import asyncio, json, sys
from intelli.flow import Agent, Task, Flow, TextTaskInput, ToolDynamicConnector
from providers import gpt

TOOLS = [{"type": "function", "function": {
    "name": "lookup_order",
    "description": "Get the shipping status of an order by id, for example A-1001",
    "parameters": {"type": "object",
                   "properties": {"order_id": {"type": "string"}},
                   "required": ["order_id"]}}}]

def tool_call_to_mcp(tool_output):
    call = tool_output["tool_calls"][0]["function"]
    args = json.loads(call["arguments"])
    return {"update_model_params": {"tool": call["name"],
                                    **{f"arg_{k}": v for k, v in args.items()}}}

router = Task(TextTaskInput("Answer the customer. Call a tool when you need order data."),
              gpt("You are a support assistant for an online store.", model="gpt-4.1", tools=TOOLS))
lookup = Task(TextTaskInput("Run the order lookup"),
              Agent("mcp", "mcp", "Order tools",
                    {"command": sys.executable, "args": ["order_server.py"]}),
              pre_process=tool_call_to_mcp, model_params={})
direct = Task(TextTaskInput("Rewrite this answer for the customer in two sentences."),
              gpt("You answer store policy questions."))

flow = Flow(
    tasks={"router": router, "lookup": lookup, "direct": direct},
    map_paths={},
    dynamic_connectors={"router": ToolDynamicConnector(
        destinations={"tool_called": "lookup", "no_tool": "direct"})},
)
result = asyncio.run(flow.start(initial_input="Where is my order A-1001?"))
print(result.get("lookup", result.get("direct"))["output"])
```

Details that are easy to miss:

- Intelli does not map the tool call to MCP arguments for you. The `tool_call_to_mcp` pre-process turns it into `tool` and `arg_*` params.
- Each destination receives the router's output: `lookup` gets the tool call and `direct` gets the model's text answer, not the customer's question.
- Pass `model_params={}` on the MCP task. `Task` has a shared mutable default, and updated params would otherwise leak into other tasks.
- The router must be an OpenAI or Anthropic agent, because Gemini and Mistral tool calls are not parsed into the shape the connector checks. Intelli passes the tools list through unchanged. This one uses the chat completions format, hence `gpt-4.1`. GPT-5 models go through the Responses API, which expects the flat tool format, and Anthropic expects `input_schema`.
- Tool choice depends on the model. In our tests a 0.5B local model called `lookup_order` for a return policy question and sometimes skipped it for a real order id.

See the [dynamic tool docs](/docs/python/flows/dynamic-tool) for the connector and the [MCP server docs](/docs/python/mcp/server) for streamable HTTP servers.

## Pattern 6: your own code and approval steps

Not every step should be a model. A `CustomAgent` wraps your own Python, such as a CRM lookup, and sits in the graph like any other agent. The same shape works as a human approval gate before an action.

```python
import asyncio
from intelli.flow import CustomAgent, Task, Flow, TextTaskInput, DynamicConnector
from providers import claude

class CRMLookup(CustomAgent):
    def execute(self, agent_input, new_params=None):
        account = agent_input.desc.strip()
        # call your CRM API or database here
        return f"Account {account}: Business plan, 40 seats, renews 1 May, 2 open tickets"

class ApprovalGate(CustomAgent):
    def execute(self, agent_input, new_params=None):
        draft = agent_input.desc.split("\n\n", 1)[-1]   # drop the task header Intelli adds
        print("\n--- draft for review ---\n" + draft)
        approved = input("Approve and send? [y/N] ").strip().lower() == "y"
        return "APPROVED\n" + draft if approved else "REJECTED"

class SendEmail(CustomAgent):
    def execute(self, agent_input, new_params=None):
        # call your email provider here
        return "sent"

flow = Flow(
    tasks={
        "crm": Task(TextTaskInput("acme corp"), CRMLookup("text")),
        "draft": Task(TextTaskInput("Write a short renewal check-in email using the CRM note."),
                      claude("You write emails for account managers.")),
        "approve": Task(TextTaskInput("Human review"), ApprovalGate("text")),
        "send": Task(TextTaskInput("Send the approved email"), SendEmail("text")),
    },
    map_paths={"crm": ["draft"], "draft": ["approve"]},
    dynamic_connectors={"approve": DynamicConnector(
        lambda out, out_type: "send" if str(out).startswith("APPROVED") else "stop",
        {"send": "send"}, name="human_approval")},
)
result = asyncio.run(flow.start())
print(sorted(result))   # 'send' is only there when the reviewer typed y
```

A rejected draft returns the key "stop", which is not a destination, so the flow ends before `SendEmail`.

The approval logic is your application code. `input()` works for a CLI or an internal script. In a web app, end the flow at the gate, save the draft as pending, and start a second flow when a reviewer approves. Intelli does not checkpoint a paused flow and resume it, which is a real gap if reviews take hours.

## Intelli flows vs LangGraph, CrewAI and plain code

If you are comparing LangGraph alternatives in Python, be precise about what each tool is built for. Sources, checked on September 30, 2026: LangGraph's [persistence](https://docs.langchain.com/oss/python/langgraph/persistence) and [graph API](https://docs.langchain.com/oss/python/langgraph/graph-api) docs and [GitHub repo](https://github.com/langchain-ai/langgraph), and CrewAI's [Flows](https://docs.crewai.com/en/concepts/flows) and [LLM](https://docs.crewai.com/en/concepts/llms) docs and [GitHub repo](https://github.com/crewAIInc/crewAI). Star counts change daily.

| | Intelli flows | LangGraph | CrewAI | Plain Python |
|---|---|---|---|---|
| Core idea | Tasks and agents in a DAG, with routers and loop nodes | Stateful graph of nodes and conditional edges | Role-based crews, plus event-driven Flows | Your own functions and `asyncio` |
| State and persistence | In-process `Memory` or SQLite `DBMemory`; no checkpoint and resume | Checkpointers (`InMemorySaver`, `SqliteSaver`, `PostgresSaver`) and durable execution | Pydantic or dict state; `@persist` saves to SQLite | Whatever you build |
| Loops and branching | Connectors for branching; cycles rejected, use `LoopTask` | Cycles supported, recursion limit of 1000 super-steps by default | `@router` for branching, `or_` and `and_` to join listeners | `if` and `while` |
| Human in the loop | A custom gate step; you store and restart | `interrupt()` pauses, `Command(resume=...)` continues | `@human_feedback` decorator | Your own |
| Providers per step | Built-in: OpenAI, Anthropic, Gemini, Mistral, NVIDIA, vLLM or Ollama, llama.cpp | Any model you call inside a node | `llm` per agent, native or through LiteLLM | Each vendor SDK |
| Ecosystem | Small, fewer integrations | 42.5k GitHub stars, LangSmith tracing, JS version | 59.2k GitHub stars, MCP and A2A support | None needed |
| Concepts to learn | Agent, Task, Flow, connectors | State, nodes, edges, checkpointers, threads | Agents with roles, tasks, crews, flows | None, but you write retries and fan out |

**Choose Intelli flows** when the steps are known, you want a different provider per step or local models in CI, and your team would rather learn four classes than a new state model. **Choose LangGraph** when runs are long, must survive crashes, or pause for a person and resume hours later. Its [interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) use a checkpointer and a thread ID, exactly the machinery Intelli lacks. It works without LangChain, and its [README](https://github.com/langchain-ai/langgraph) lists durable execution as a core feature.

**Choose CrewAI** when the problem maps to roles and goals, or you like decorator-style [Flows](https://docs.crewai.com/en/concepts/flows) with persistence built in. **Write plain code** for two or three calls with no branching. Anthropic's post says the same: start with direct API calls, since framework layers can hide the prompts you debug.

## From prototype to production

**Check `flow.errors` before you use any output.** Agent failures come back as `Error: ...` strings, not exceptions, and downstream steps still run on that text. In our test with a dead endpoint on the risks step, the reply step wrote the customer an apology about a connection problem. MCP tasks are the exception: a failed tool call returns text such as `Error from MCP tool ...`, which `flow.errors` does not record, so check that output too.

```python
# continuing the support flow from pattern 2
import logging

result = asyncio.run(flow.start(max_workers=4, initial_input=ticket))

if flow.errors:                    # failed agents return "Error: ..." text, not exceptions
    for step, message in flow.errors.items():
        logging.error("step %s failed: %s", step, message[:300])

flow.generate_graph_img(name="support_flow", save_path=".")   # needs "intelli[visual]"
```

Send those tickets to a retry or a manual queue, not the customer.

**Log and draw the graph.** `log=True` on a `Task` prints the start of its input and output, and on a `Flow` it logs routing decisions and soft errors. `generate_graph_img` writes a PNG with every node labeled by agent type and provider, handy when security asks which vendor sees which data. It needs `pip install "intelli[visual]"`.

**Draft flows from plain language.** Vibe Agents turn a description into a flow spec that you can review, commit and rebuild without calling the planner again.

```python
import asyncio, os
from intelli.flow import VibeAgent

async def main():
    vibe = VibeAgent(planner_provider="anthropic",
                     planner_api_key=os.environ["ANTHROPIC_API_KEY"],
                     planner_model="claude-sonnet-5")   # set it: the default is an OpenAI model
    flow = await vibe.build(
        "Read a support ticket, extract the facts and the churn risks in parallel, "
        "then write a reply from both.",
        save_dir="./ticket_flow")   # writes flow_spec.json and a graph image
    print(await flow.start(initial_input="Order #1001 arrived damaged."))

    # later, in CI or production: rebuild from the reviewed spec, no planner call
    same_flow = vibe.build_from_spec(vibe.load_spec("./ticket_flow/flow_spec.json"))

asyncio.run(main())
```

Always set `planner_model` for a non-OpenAI planner, and use a strong one: a 0.5B local model returned invalid JSON in our tests. The [Vibe Agents docs](/docs/python/vibe-agents) cover editing a saved spec.

**Develop against local models.** Swap the helpers in `providers.py` for `local()` and run the flows in CI against Ollama with no token spend. One exception: the `vllm` provider does not forward tools. For the tool routing pattern, use the OpenAI provider with a `ProxyHelper` pointed at Ollama:

```python
# in the pattern 5 script, build the router Task with this agent
from intelli.utils.proxy_helper import ProxyHelper

ollama = ProxyHelper()
ollama.set_openai_proxy_values({"base": "http://localhost:11434"})
router_agent = Agent("text", "openai", "You are a support assistant for an online store.",
                     {"key": "ollama", "model": "qwen2.5:0.5b", "tools": TOOLS},
                     options={"proxy_helper": ollama})
```

Small local models are good for testing wiring and error handling, not for judging output quality.

## FAQ

### Is an agentic workflow the same as a multi-agent system?

Close, but not the same. A multi-agent system in Python is any setup where several agents with different jobs cooperate. An agentic workflow fixes how they cooperate in code: the graph sets the order, and each agent decides only within its step. Intelli flows are a multi-agent framework in Python built around that idea.

### What is the best LangGraph alternative in Python?

It depends on what you need. For known steps across several providers, a lighter graph runner such as Intelli flows, or plain `asyncio`, is usually enough. CrewAI fits role-based teams of agents. For durable runs that pause for a person and resume later, LangGraph itself is hard to beat.

### Can AI agents run in parallel in Python?

Yes. In an Intelli `Flow`, tasks with no dependency between them run at the same time in a thread pool, capped by `max_workers`. A task with several parents waits for all of them and receives their outputs merged.

### Can an agent workflow loop back to an earlier step?

Not as a graph edge in Intelli, because `Flow` rejects cycles with a `ValueError`. Use `LoopTask` to repeat steps inside one node with a stop condition. Its `max_loops` cap also bounds the cost of a run.

### What happens when one step of the workflow fails?

The failed task's output becomes an `Error: ...` string, and its name appears in `flow.errors`. MCP tool failures return `Error from MCP tool ...` text instead and are not recorded there. The flow keeps going, so later tasks may run on that error text. Check `flow.errors` after every run and route failures to a retry or a person.

## Start with one pattern

Pick the pattern closest to a process you already run, usually the chain or the router, and get it working on a local model before you add hosted providers.

```bash
pip install intelli
pip install "intelli[mcp]"      # MCP servers and tool routing
pip install "intelli[visual]"   # flow graph images
```

Then follow the [flows get started guide](/docs/python/flows/get-started) to build your first `Flow` with your own tasks.
