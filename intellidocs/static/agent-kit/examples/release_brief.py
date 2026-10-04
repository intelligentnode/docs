# release_brief.py: a weekly release brief from commit messages
import asyncio

from intelli.flow import Flow, Task, TextTaskInput, Memory

from helpers import local_agent, Prompt

COMMITS = """\
feat(editor): add markdown tables to the note editor
feat(sync): offline edits now sync when the device reconnects
feat(search): search inside PDF attachments
fix(sync): duplicate notes created after a sync conflict
fix(ios): app crashed when sharing a note with an emoji title
fix(api): rate limit returned 500 instead of 429
perf(search): index builds 2x faster on large workspaces
feat!: remove the legacy v1 export API
chore(deps): upgrade sqlite to 3.46
refactor(sync): split conflict resolver into its own module
docs: document the new export API
"""


def group_commits(text):
    """Plain Python sorts conventional commits better than a small model does."""
    groups = {"features": [], "fixes": [], "risks": []}
    for line in filter(None, map(str.strip, text.splitlines())):
        prefix, _, subject = line.partition(":")
        subject = subject.strip()
        if "!" in prefix:
            groups["risks"].append(subject + " (breaking change)")
        elif prefix.startswith("feat"):
            groups["features"].append(subject)
        elif prefix.startswith(("fix", "perf")):
            groups["fixes"].append(subject)
        elif prefix.startswith(("chore(deps)", "refactor")):
            groups["risks"].append(subject + " (internal change, watch for regressions)")
    # never store an empty string: the task would run on its instruction alone and invent items
    return {name: "\n".join(f"- {s}" for s in items) or "(none this week)" for name, items in groups.items()}


def section(title, instruction):
    return Task(TextTaskInput(instruction),
                local_agent(f"You write the {title} section of a weekly release brief.", 200),
                template=Prompt(f"{title} commits this week:\n{{input}}\n\n{instruction} Use only the commits above."),
                memory_key=title.lower())


def build_flow(memory):
    tasks = {
        "features": section("Features", "Rewrite each commit as one plain-English bullet for users."),
        "fixes": section("Fixes", "Rewrite each commit as one plain-English bullet."),
        "risks": section("Risks", "For each item, say in one bullet what could break and who should check it."),
        "brief": Task(
            TextTaskInput("Write the weekly release brief."),
            # "synthesize" in the mission makes Flow label each section in the merged input
            local_agent("You synthesize section drafts into one weekly release brief. Do not add new items.", 400),
            template=Prompt("Section drafts:\n{input}\n\nWrite the weekly release brief in markdown with the "
                            "sections Features, Fixes and Risks. Keep every item, add nothing new."),
        ),
        "headline": Task(
            TextTaskInput("Write one headline for the brief."),
            local_agent("You write short headlines.", 30),
            template=Prompt("Release brief:\n{input}\n\nWrite one headline under 12 words for this brief. "
                            "Answer with the headline only."),
        ),
    }
    return Flow(
        tasks=tasks,
        map_paths={"features": ["brief"], "fixes": ["brief"], "risks": ["brief"], "brief": ["headline"]},
        memory=memory,
        output_memory_map={"brief": "brief_md"},
    )


async def main():
    memory = Memory()
    for name, items in group_commits(COMMITS).items():
        memory.store(name, items)
    flow = build_flow(memory)
    out = await flow.start(max_workers=4)
    if flow.errors:
        raise RuntimeError(flow.errors)
    headline = out["headline"]["output"].strip().strip('"')
    with open("brief.md", "w") as f:
        f.write(f"# {headline}\n\n{memory.retrieve('brief_md').strip()}\n")
    print(headline)


if __name__ == "__main__":
    asyncio.run(main())
