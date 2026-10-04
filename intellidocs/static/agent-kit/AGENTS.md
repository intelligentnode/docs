## Using Intelli (Python) to build agent flows

Install with `pip install intelli` (2.0.3) and import from `intelli.flow`:
`from intelli.flow import Agent, Task, TextTaskInput, Flow, SequenceFlow, DynamicConnector, Memory, VibeAgent`

Agents and tasks
- Cloud: `Agent("text", "openai", "mission", {"key": os.environ["OPENAI_API_KEY"], "model": "<model>"})`. Never hardcode keys.
- Local, no key (Ollama or vLLM): `Agent("text", "vllm", "mission", {"model": "<ollama tag>", "temperature": 0.2, "max_tokens": 300}, options={"baseUrl": "http://localhost:11434"})`
- `Task(TextTaskInput("instruction"), agent, post_process=fn, memory_key="name", exclude=False, template=obj)`
- The default temperature is 1. Set `temperature` in model_params for labels and extraction.

Flow (async graph)
- `flow = Flow(tasks={"a": ta, "b": tb, "c": tc}, map_paths={"a": ["c"], "b": ["c"]}, memory=Memory())`
- `out = await flow.start(initial_input=text, max_workers=4)`, then read `out["c"]["output"]`. Every task with no parent gets `initial_input`, and tasks that are ready at the same time run in parallel.
- A task with several parents gets their outputs joined. If its mission contains "synthesize" or "integrate", each part is labeled with the parent's name.
- Routing: `dynamic_connectors={"a": DynamicConnector(decision_fn=lambda out, kind: "x", destinations={"x": "task_x", "y": "task_y"})}`. Only the chosen task runs (4 destinations at most).
- Task failures do not raise. Check `flow.errors` (a dict) after every run.
- `SequenceFlow([t1, t2]).start()` is synchronous and returns `{"task1": ..., "task2": ...}`.
- Diagram: `flow.generate_graph_img(name="graph", save_path=".", show_legend=False)` (needs matplotlib).

Vibe Agents (a flow from a plain language intent)
- `va = VibeAgent(planner_provider="anthropic", planner_api_key=os.environ["ANTHROPIC_API_KEY"], planner_model="<model>")`, then `flow = await va.build(intent, save_dir="bundle")`
- Reload without planning: `flow = va.build_from_spec(va.load_bundle("bundle/vibeflow_bundle.json"))`. The bundle stores the spec path exactly as given, so pass an absolute `save_dir`, or load with `va.load_spec("bundle/flow_spec.json")`.
- You can be the planner: write the FlowSpec JSON yourself and call `va.build_from_spec(spec)`, or pass `planner_fn=lambda system, user: spec`.
- Put `${ENV:NAME}` in specs, never keys. An unset variable stays as literal text, so check the environment first.
- Before `flow.start()`, check each `flow.tasks[name].agent.provider`. A task without `agent.agent_type` skips validation and defaults to `openai`.
- Register processors every time you load a spec: `VibeAgent(processors={"name": fn})`. Unknown `post_process` names are skipped silently.

Pitfalls
- Never make one task depend on two branches of the same DynamicConnector. Only one branch runs, so that task never runs, and nothing errors.
- `memory_key` replaces the input from parent tasks. With a list of keys, each value is cut to 100 characters.
- An empty string from memory makes the task run on its description alone. Store "(none)" instead.
- `TextInputTemplate` does not fill `{0}`; it appends the input. For exact prompts, pass any object with `apply_input(data) -> str` as `template=`.
- Tiny local models are poor planners and labelers: qwen2.5:0.5b produced 0 valid VibeAgent specs in 42 tries. For a local planner, set `max_context_chars=0` (the default prompt is about 96k characters, and `context_files=[]` does not shrink it).
- Docs index: https://www.intellinode.ai/llms.txt (local copy: docs/intellinode-llms.txt). Before using an Intelli API that is not listed above, open the matching page from the index.
