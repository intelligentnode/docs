---
name: intelli-flows
description: Use when writing or changing Python code that builds an AI agent app with Intelli (intelli.flow), such as a Flow graph, routing with DynamicConnector, Memory, or a Vibe Agent and its FlowSpec JSON. Not for IntelliNode on Node.js.
---

# Writing Intelli flows

Follow the Intelli section of AGENTS.md, then these rules.

1. Run every agent on local Ollama unless the user names a cloud provider:
   provider "vllm", options {"baseUrl": "${ENV:OLLAMA_BASE_URL}"} in specs, http://localhost:11434 in code.
2. For a Vibe Agent you are the planner. Write the FlowSpec JSON yourself, save it in the repo,
   and load it with `planner_fn` or `build_from_spec`. Use this shape:

   {"version": "1",
    "tasks": [{"name": "thread", "desc": "what the task does", "post_process": "flag_new_numbers",
               "agent": {"agent_type": "text", "provider": "vllm", "mission": "who the agent is",
                         "model_params": {"model": "qwen2.5:0.5b", "temperature": 0.3, "max_tokens": 300},
                         "options": {"baseUrl": "${ENV:OLLAMA_BASE_URL}"}}}],
    "map_paths": {}, "dynamic_connectors": [], "output_memory_map": {}}

3. Every task needs `agent.agent_type`. Without it validation is skipped and the provider becomes openai.
4. Name each `post_process` in the spec and register the same names with `VibeAgent(processors=...)`
   every time the spec is loaded. Unknown names are skipped silently.
5. Before `flow.start()`, loop over `flow.tasks` and raise if any `agent.provider` is not the one
   the user asked for. After every run, raise if `flow.errors` is not empty.
6. For anything else, fetch https://www.intellinode.ai/llms.txt and open the page it lists.
7. The user may not read code. When the flow is written, run it, save its picture with
   `flow.generate_graph_img(name="<tool>_graph", save_path=".", show_legend=False)`, and report in plain
   language: what each step does, which provider each step uses, and where the picture and the output
   files are.
