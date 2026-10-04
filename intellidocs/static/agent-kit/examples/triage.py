# triage.py: support ticket triage with a Flow graph and a router
import asyncio

from intelli.flow import Flow, Task, TextTaskInput, DynamicConnector, ConnectorMode, Memory

from helpers import local_agent, Prompt

TICKETS = [
    "I was charged twice for my March invoice. Please refund the duplicate payment.",
    "Your API has returned 500 errors for every request since 9am. Our checkout is down and we are losing sales.",
    "How do I change the email address on my account?",
    "It would be great to have a dark mode in the dashboard.",
    "Someone logged into my account from another country and changed my password. I am locked out.",
    "The CSV export button does nothing in Safari. It works in Chrome.",
]


def step(instruction, mission, max_tokens, temperature=0.2, **options):
    """One task that always sees the ticket first, then the instruction."""
    return Task(TextTaskInput(instruction), local_agent(mission, max_tokens, temperature),
                template=Prompt("Support ticket:\n{input}\n\n" + instruction), **options)


def label(allowed, fallback):
    """post_process: map a small model's free text onto one allowed word."""
    return lambda text: next((word for word in allowed if word in str(text).lower()), fallback)


def build_flow(memory):
    tasks = {
        "category": step("Classify the support ticket into one category: billing, bug, account or feature. "
                         "Answer with the category word only.", "You are a support ticket classifier.", 5, 0,
                         post_process=label(["billing", "bug", "account", "feature"], "other")),
        "urgency": step("Rate the urgency as high, medium or low. High means a service is down, money is "
                        "being lost or an account is compromised. Answer with one word.",
                        "You are a support triage lead.", 5, 0,
                        post_process=label(["high", "low"], "medium")),
        "summary": step("Summarize the customer's problem in one short sentence.",
                        "You summarize support tickets.", 60),
        "escalation": step("Write a 3 line escalation note for the on-call engineer: what is broken, "
                           "who is affected, and the first thing to check.",
                           "You are a senior support engineer.", 120, memory_key="ticket"),
        "reply": step("Write a short, polite reply to the customer that acknowledges the issue and gives "
                      "one next step. Do not promise refunds or dates.",
                      "You are a friendly support agent.", 120, memory_key="ticket"),
    }
    router = DynamicConnector(
        decision_fn=lambda output, output_type: "escalate" if output == "high" else "reply",
        destinations={"escalate": "escalation", "reply": "reply"},
        name="urgency_router",
        mode=ConnectorMode.CUSTOM,
    )
    return Flow(tasks=tasks, map_paths={}, dynamic_connectors={"urgency": router}, memory=memory)


async def triage(ticket):
    memory = Memory()
    memory.store("ticket", ticket)  # escalation and reply read the original ticket from here
    flow = build_flow(memory)
    out = await flow.start(initial_input=ticket, initial_input_type="text")
    if flow.errors:  # failed tasks are recorded here, not raised
        raise RuntimeError(flow.errors)
    route = "escalation" if "escalation" in out else "reply"
    result = {name: out[name]["output"].strip() for name in ("category", "urgency", "summary", route)}
    result["route"] = route
    return result


async def main():
    lines = ["# Ticket triage", ""]
    for ticket in TICKETS:
        result = await triage(ticket)
        print(f"[{result['category']:8}|{result['urgency']:6}] -> {result['route']:10} {ticket[:45]}")
        lines += [f"## {result['category']} / {result['urgency']}", f"> {ticket}", "",
                  result["summary"], "", f"**{result['route']}:** {result[result['route']]}", ""]
    with open("triage.md", "w") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    asyncio.run(main())
