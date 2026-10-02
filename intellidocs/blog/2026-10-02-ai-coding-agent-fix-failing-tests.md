---
slug: ai-coding-agent-fix-failing-tests
title: "Build an AI Coding Agent That Fixes Failing Tests"
description: "Build an AI coding agent in Node.js that fixes failing tests, refuses to finish until npm test passes, and runs on OpenAI, Claude, Gemini or Ollama."
keywords: ["ai coding agent that fixes failing tests", "coding agent that runs tests until they pass", "build a coding agent", "coding agent node js", "what is an agent harness", "self-healing ci", "stop coding agents cheating on tests", "local coding agent ollama", "coding agent python", "llm code review with a different model"]
tags: [{label: "Node.js", permalink: "/nodejs"}, "AI Agents", "Coding Agents", "CI", "Tutorial"]
authors: [intellinode]
image: /img/articles/ai-coding-agent-fix-failing-tests.jpg
image_alt: "Loose shapes settling into an ordered grid, like a coding agent turning failing tests into passing ones"
date: 2026-10-02T09:00:00Z
---

A small SaaS team bumps a dependency on Monday morning and 14 tests go red. Nothing is seriously broken. A helper now rounds a little differently, and someone gives up the morning to fixes that are dull, careful and easy to get slightly wrong.

That morning is a good job for an AI coding agent that fixes failing tests. It takes the first pass while the team does something else, but only if "done" means the tests really pass and a person still approves the merge. An agent that says it's finished, or quietly edits the tests until they agree, costs more time than it saves.

By the end of this guide you'll have a short Node.js script that fixes a failing test, refuses to stop early, can't rewrite your tests, and opens a pull request for someone to review. It runs on a cloud model or on your own machine.

![Loose shapes settling into an ordered grid, like a coding agent turning failing tests into passing ones](/img/articles/ai-coding-agent-fix-failing-tests.jpg)

<!-- truncate -->

## What a coding agent harness is

Before any code, it helps to name the parts that make the Monday fix safe to hand over.

A coding agent is a model in a loop. Each turn the model picks one tool, such as reading a file, editing one or running a command, and the loop runs it and shows the result. Three more pieces let you leave it alone: an iteration budget, a workspace it can't step outside, and a test gate that won't accept "I'm finished" until the test command passes.

Together, that's what people started calling an agent harness in 2026: "Agent = Model + Harness", in Birgitta Böckeler's phrase. In marmelab's [state of harness engineering](https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html) report, one model ran the same 25 tasks through 8 harnesses and scored anywhere from 68% to 88%.

Here is that loop for the Monday fix, where only exit code 0 from `npm test` counts as done:

![Diagram of the coding agent loop: a failing test goes to the agent, its finish goes to the npm test gate, a failure goes back, exit code 0 is done](pathname:///img/articles/diagrams/ai-coding-agent-fix-failing-tests-loop.svg)

*The agent can say it's finished. Only the test gate can say it's done, and a failure sends it back to work.*

## Set up a repo with one failing test

The loop needs something to fix, so start with the smallest red build you can make.

The repo is a pricing module after a refactor. Prices are whole cents and a discount should round half a cent up, but the refactor swapped `Math.round` for `Math.floor`. Node's built-in test runner means the repo has nothing to install. IntelliNode, the agent library this guide uses, goes in the folder above it:

```bash
mkdir agent-demo && cd agent-demo
npm i intellinode
mkdir -p pricing/src pricing/test
```

Then add three files, starting with `pricing/package.json`:

```json
{
  "name": "pricing",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "node --test"
  }
}
```

```javascript
// pricing/src/pricing.js
// Prices are whole cents. A discount rounds to the nearest cent.
function applyDiscount(priceCents, percent) {
  return Math.floor((priceCents * (100 - percent)) / 100);
}

module.exports = { applyDiscount };
```

```javascript
// pricing/test/pricing.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { applyDiscount } = require('../src/pricing');

test('takes 25% off', () => {
  assert.equal(applyDiscount(8000, 25), 6000);
});

test('rounds half a cent up', () => {
  assert.equal(applyDiscount(999, 50), 500);
});
```

Commit and run the tests:

```bash
cd pricing
git init && git add -A && git commit -m "pricing with a rounding bug"
npm test
# not ok 2 - rounds half a cent up
#   499 !== 500
# # pass 1
# # fail 1
cd ..
```

Git will show what the agent changed. The Node.js snippets here ran on Node.js 20.

## Watch the test gate work with no model at all

You've seen the loop on paper. Now watch the gate refuse a false "done", with no model and no API key.

IntelliNode's `CodingAgent` normally asks a provider's model for each turn. The `chatFn` setting swaps that for any async `(system, history) => text` function. Here it plays three canned replies, and the first one finishes without fixing anything.

```javascript
// gate-demo.js: watch the test gate work, with no model and no API key
const { CodingAgent } = require('intellinode');

// three canned replies, in the same JSON format a real model must use
const replies = [
  '{"thought": "Looks fine to me", "tool": "finish", "args": {"summary": "Nothing to fix"}}',
  '{"thought": "floor drops the half cent", "tool": "edit_file", "args": {"path": "src/pricing.js", "old_text": "Math.floor", "new_text": "Math.round"}}',
  '{"thought": "Should pass now", "tool": "finish", "args": {"summary": "Round to the nearest cent"}}',
];

async function main() {
  let turn = 0;
  const agent = new CodingAgent({
    workspace: './pricing',
    chatFn: async (system, history) => {
      // print the start of what the agent just told the "model"
      const last = history[history.length - 1].content;
      console.log('agent says:', last.split('\n').filter(Boolean).slice(0, 2).join(' '));
      return replies[turn++];
    },
  });

  const result = await agent.run('npm test fails. Fix the code, not the tests.', { testCommand: 'npm test' });
  console.log(result.success, result.iterations, result.summary);
  console.log(result.testOutput.split('\n')[0]);
}

main();

// agent says: Task: npm test fails. Fix the code, not the tests. Workspace files:
// agent says: Tests are still failing. Fix them before finishing. [exit code 1]
// agent says: [edit_file result] Edited src/pricing.js
// true 3 Round to the nearest cent
// [exit code 0]
```

The first finish was refused: the agent ran `npm test` itself, saw exit code 1 and sent the failing output back. `run()` resolves with `{ success, summary, iterations, testOutput }`, and `success` is true only when the test output starts with `[exit code 0]`. The model's opinion of its own work never decides it. Run `git -C pricing checkout -- .` to put the bug back.

Each reply is one JSON object with `thought`, `tool` and `args`. That's plain text, so the agent needs no native function calling and runs the same on OpenAI, Anthropic, Gemini, Mistral, Cohere and local models ([Build AI Agents in Node.js](/articles/build-ai-agents-nodejs) covers the function calling route). The parser copes with braces inside strings and takes the last object that names a tool. The tools are `read_file`, `write_file`, `edit_file`, `list_files`, `search`, `bash` and `finish`, and the [coding agent docs](/docs/npm/agents/coding-agent) list every setting.

## Run the AI coding agent that fixes failing tests on a real model

The gate works with a script. Now give the same loop a real model and let it find the bug.

```javascript
// fix.js: a real model fixes the failing test
const { CodingAgent } = require('intellinode');

const models = {
  anthropic: { provider: 'anthropic', model: 'claude-sonnet-5', apiKey: process.env.ANTHROPIC_API_KEY },
  openai: { provider: 'openai', model: 'gpt-5.5', apiKey: process.env.OPENAI_API_KEY },
  gemini: { provider: 'gemini', model: 'gemini-3.6-flash', apiKey: process.env.GEMINI_API_KEY },
  ollama: { provider: 'ollama', model: process.env.OLLAMA_MODEL || 'qwen2.5:0.5b' }, // local, no key
};

async function main() {
  const agent = new CodingAgent({
    ...models[process.env.LLM || 'anthropic'],
    workspace: './pricing',
    maxIterations: 8,
    onAction: ({ iteration, tool, args }) => console.log(`#${iteration} ${tool} ${args.path || args.command || ''}`),
  });

  const result = await agent.run('npm test fails. Find the cause in src/ and fix it. Do not change the tests.', {
    testCommand: 'npm test',
  });
  console.log(result.success, result.iterations, result.summary);
  if (!result.success) console.log(result.testOutput.split('\n').slice(0, 3).join('\n'));
}

main();
```

`LLM=openai node fix.js` switches providers, as do `gemini` and `ollama`. `onAction` only logs here, and `maxIterations` caps model calls at 8 (default 20).

We didn't call a paid model for this guide, so the cloud entries were only checked by building the agent. On Ollama with `qwen2.5:0.5b`, a half-billion-parameter model, the protocol held up but the fixing didn't. In 24 runs of 8 iterations it passed once, by reading `src/pricing.js`, swapping the rounding call and finishing. In the other 23 it invented tools (`find_file`, `npm`), repeated one action for eight turns, sent edits whose `old_text` wasn't in the file, or said finish with the tests still red. The gate refused every early finish, so `success: true` showed up only in the run that really passed.

A tiny model is fine for testing the wiring, not for fixing code. For code that must stay in-house, try a coding model of about 7B or more, such as `qwen2.5-coder:7b` (4.7 GB on Ollama). We haven't tested those, so measure first.

One more thing: `write_file` without content writes an empty file, so work on a branch with a clean tree, where `git diff` shows everything.

## Stop the agent from cheating on the tests

A gate that only checks "tests pass" has an obvious weak spot: the agent can change the tests.

This happens often enough to have a name, reward hacking. A [2026 summary of reward hacking research](https://aimlcompanion.ai/blog/reward-hacking-coding-agents-2026) cites METR seeing o3 game the scoring in 39 of 128 runs, ImpossibleBench finding GPT-5 cheating on 54% of impossible tasks, and Anthropic reporting that Claude 3.7 Sonnet sometimes edited tests or hard-coded expected values.

A line in the prompt isn't a control, but `onAction` can be. It's awaited before every tool, `finish` included, and if it throws, `run()` rejects before that tool runs.

```javascript
// guard.js: stop the run if the agent touches the tests or runs an unknown command
const path = require('path');

const PROTECTED = ['test/', '.github/', '.git/', 'package.json', 'package-lock.json'];
const ALLOWED_COMMANDS = new Set(['npm test', 'node --test', 'git diff', 'git status']);

// lowercase, so 'Test/x.js' is caught on case-insensitive disks
function isProtected(file) {
  const name = file.toLowerCase();
  return PROTECTED.some((p) => (p.endsWith('/') ? name.startsWith(p) : name === p));
}

function makeGuard(workspace) {
  const root = path.resolve(workspace);
  return ({ iteration, tool, args }) => {
    console.log(`#${iteration} ${tool} ${args.path || args.command || ''}`);

    if (tool === 'write_file' || tool === 'edit_file') {
      // normalize, so 'src/../test/x.js' is caught too
      const file = path.relative(root, path.resolve(root, String(args.path || ''))).split(path.sep).join('/');
      if (isProtected(file)) throw new Error(`Blocked: the agent tried to change ${file}`);
    }
    if (tool === 'bash' && !ALLOWED_COMMANDS.has(String(args.command || '').trim())) {
      throw new Error(`Blocked command: ${args.command}`);
    }
  };
}

module.exports = { makeGuard, isProtected };
```

`package.json` is protected because `npm test` reads its script from there. Commands must match the allowlist exactly, so `npm test && curl ...` is refused, while the gate's own test run skips `onAction`. Here's the guard against an agent that goes for the test file:

```javascript
// cheat-demo.js: what happens when the agent goes for the test file
const { CodingAgent } = require('intellinode');
const { makeGuard } = require('./guard');

const agent = new CodingAgent({
  workspace: './pricing',
  onAction: makeGuard('./pricing'),
  chatFn: async () =>
    '{"thought": "make the test agree", "tool": "edit_file", ' +
    '"args": {"path": "test/pricing.test.js", "old_text": "500", "new_text": "499"}}',
});

agent.run('npm test fails. Fix it.', { testCommand: 'npm test' })
  .then((result) => console.log(result.success))
  .catch((error) => console.error('Stopped for a person to check:', error.message));

// #1 edit_file test/pricing.test.js
// Stopped for a person to check: Blocked: the agent tried to change test/pricing.test.js
```

In `fix.js`, swap the log line for `onAction: makeGuard('./pricing')`. A thrown error means "a person needs to look", and earlier edits stay on disk.

The guard checks what the agent asks for. A second layer checks what changed on disk, as the CI script below does with git. Then keep hidden tests that only CI adds after the agent is done. An agent can still special-case inputs in the source, like `if (priceCents === 999) return 500`, and only unseen tests plus a person reading the diff catch that.

Three gotchas we confirmed:

- **`allowBash: false` also turns off the test gate.** The test command uses the same shell, so `success` can never be true, even with the right fix in place. Keep bash on and limit it with `onAction`.
- **Bash isn't sandboxed.** File tools refuse paths outside the workspace, symlinks included. Shell commands run as you, and one local run tried `mkdir -p` on an absolute path. The allowlist limits what the agent types, not what its code does when `npm test` runs it, so use a container or a throwaway CI runner.
- **Shell commands see your environment.** Each gets a copy of `process.env`, while the model client keeps its key from the constructor, so delete keys right after building the agent. With a fake key and a local stand-in endpoint, requests still carried the key and `echo $ANTHROPIC_API_KEY` in the agent's shell printed nothing.

## Self-healing CI that opens a PR, never auto-merges

With a gate and a guard in place, the agent can run where red builds happen: in CI.

Here is the flow, from a red build on a fresh checkout to a person who merges the PR, or doesn't:

![Diagram of self-healing CI: a red build starts the guarded coding agent, its diff goes to a reviewer on another model, and the report goes to a person who merges the PR](pathname:///img/articles/diagrams/ai-coding-agent-fix-failing-tests-ci.svg)

*The agent proposes a fix, a different model family checks the diff, and a person always makes the final call.*

Put the script at `.github/agent/fix-tests.js` with a copy of `guard.js`. Since `.github/` is protected, the agent can't edit its own guard. Install the library with `npm i -D intellinode`, so `npm ci` picks it up, and keep `node_modules/` in `.gitignore`, since the script stages every change with `git add -A`.

```javascript
// .github/agent/fix-tests.js: runs in CI after a red build
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { CodingAgent, Gen } = require('intellinode');
const { makeGuard, isProtected } = require('./guard');

const sh = (command) => execSync(command, { encoding: 'utf8' }).trim();

async function main() {
  const workspace = process.cwd();
  const agent = new CodingAgent({
    apiKey: process.env.ANTHROPIC_API_KEY,
    provider: 'anthropic',
    model: 'claude-sonnet-5',
    workspace,
    maxIterations: 15,
    onAction: makeGuard(workspace),
  });
  const reviewKey = process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY; // the agent's shell commands and tests can't read them now
  delete process.env.OPENAI_API_KEY;

  const result = await agent.run(
    'npm test fails on this branch. Find the cause in the source code and fix it. Do not change the tests.',
    { testCommand: 'npm test' },
  );
  if (!result.success) throw new Error(`No fix: ${result.summary}`);

  // second layer: check what changed on disk, whatever the agent said
  sh('git add -A');
  const changed = sh('git diff --cached --name-only').split('\n').filter(Boolean);
  if (!changed.length) throw new Error('Tests pass with no change. Probably a flaky test.');
  const blocked = changed.filter(isProtected);
  if (blocked.length) throw new Error(`Protected files changed: ${blocked.join(', ')}`);

  // a different model family reviews the diff
  const review = await Gen.review_code(sh('git diff --cached'), reviewKey, 'openai', { language: 'javascript' });

  const body = [
    '## What the agent changed',
    result.summary,
    '',
    `## Second-model review: ${review.score}/10`,
    review.summary,
    ...(review.issues || []).map((issue) => `- **${issue.severity}** ${issue.title}: ${issue.suggestion}`),
    '',
    `\`npm test\` passed after ${result.iterations} agent steps. Changed: ${changed.join(', ')}.`,
    'A person reviews and merges this PR. The agent never merges.',
  ].join('\n');
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP || '.', 'pr-body.md'), body);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
```

`Gen.review_code(diff, apiKey, provider, { language })` returns a `summary`, a `score` from 1 to 10 and `issues` with severity, title, description and suggestion. Claude writes the fix and GPT reviews it, so the second opinion never comes from the author.

We ran this script locally with a scripted agent and a 0.5B reviewer on Ollama, and it worked end to end. The tiny reviewer gave the fix 7/10 and a "high" issue every time. One suggested bringing `Math.floor` back and the rest asked for the change the diff already made, which is why a review is input for a person, not a verdict.

The workflow starts the agent only after a red push. We checked its YAML and shell syntax and ran the git steps locally, not on GitHub:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
      - run: npm ci
      - run: npm test

  fix:
    needs: test
    # red pushes to your own branches only, never the agent's branches
    if: failure() && github.event_name == 'push' && !startsWith(github.ref_name, 'agent/')
    runs-on: ubuntu-latest
    timeout-minutes: 20
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false # keep the push token away from the agent
      - uses: actions/setup-node@v7
        with:
          node-version: 22
      - run: npm ci
      - name: Let the agent try a fix
        run: node .github/agent/fix-tests.js
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - name: Open a draft PR for a person to review
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          BRANCH="agent/fix-${{ github.run_id }}"
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git checkout -b "$BRANCH"
          git commit -m "Fix failing tests (coding agent)"
          git push "https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" "$BRANCH"
          gh pr create --draft --base "${{ github.ref_name }}" --head "$BRANCH" \
            --title "Agent fix for the red build on ${{ github.ref_name }}" \
            --body-file "$RUNNER_TEMP/pr-body.md"
```

The guardrails in that file:

- **Pushes only.** Pull requests, forks included, never start the agent, and neither do `agent/` branches.
- **No stored credentials.** `persist-credentials: false` keeps the push token out of the checkout, so code the agent writes can't push with it.
- **One setting.** Turn on "Allow GitHub Actions to create and approve pull requests" in the repository's Actions settings. New personal repositories have it off.
- **A person starts the checks.** Per [GitHub's token docs](https://docs.github.com/en/actions/concepts/security/github_token), pushes with the job token don't trigger runs, and the PR's checks wait until someone with write access selects "Approve workflows to run".

The [engineering quality gate](/docs/npm/use-cases/engineering-quality-gate) use case grows this into a full pipeline, and the [code functions page](/docs/npm/functions/gen/code) covers `review_code` and `fix_code`.

## Cost and model choice

The job now runs on every red push, so know what a run can cost before the bill tells you.

`maxIterations` is your spend cap. Each iteration is one model call that resends the whole history, so each call is bigger than the last:

```text
total input = N x base + step x N x (N - 1) / 2

N     iterations used (at most maxIterations)
base  system prompt plus task
step  average size of one reply and its tool result
```

On the pricing repo, the first call sent about 960 characters and the eighth 3,000 to 5,100, for 16,000 to 24,000 per 8-iteration run. In a real repo one `read_file` can return 60,000 characters, and it rides along on every later call. Multiply your measured tokens by your provider's current price. To measure, wrap `chatFn`, a plain property on the agent:

```javascript
// meter.js: count what a run sends to the model
function meter(agent) {
  const send = agent.chatFn;
  const stats = { calls: 0, chars: 0 };
  agent.chatFn = async (system, history) => {
    stats.calls += 1;
    stats.chars += system.length + history.reduce((sum, message) => sum + message.content.length, 0);
    return send(system, history);
  };
  return stats;
}

module.exports = { meter };
```

Call `const stats = meter(agent)` after building the agent and log `stats` after `run()`. Roughly four characters make a token in English, so check exact counts on your provider's usage page.

Cheap, fast models can take the first pass, with a stronger one only when they fail:

```javascript
// escalate.js: a cheap model first, a stronger one only if it fails
const { execSync } = require('child_process');
const { CodingAgent } = require('intellinode');

const lanes = [
  { provider: 'gemini', model: 'gemini-3.6-flash', apiKey: process.env.GEMINI_API_KEY, maxIterations: 8 },
  { provider: 'anthropic', model: 'claude-sonnet-5', apiKey: process.env.ANTHROPIC_API_KEY, maxIterations: 15 },
];

async function fix(task, workspace) {
  for (const lane of lanes) {
    const agent = new CodingAgent({ ...lane, workspace });
    const result = await agent.run(task, { testCommand: 'npm test' });
    if (result.success) return { model: lane.model, ...result };
    // park the failed attempt, so the next model starts from a clean tree
    execSync('git stash push --include-untracked -m "failed agent attempt"', { cwd: workspace });
  }
  return { success: false, summary: 'No model fixed it. Over to a person.' };
}

fix('npm test fails. Fix the source, not the tests.', './pricing').then((result) => {
  console.log(result.success, result.model, result.summary);
});
```

The stash keeps each failed attempt for whoever looks next. When code must not leave your network, make a lane `provider: 'ollama'`, or `provider: 'vllm'` with `options: { baseUrl }`. Then you pay in hardware and time instead of tokens.

## The same agent in Python

Everything so far was Node.js. If your tooling lives in Python, the same agent is in Intelli, the project's Python library. Point it at a Python copy of the repo (`pricing.py`, `tests/test_pricing.py` and an empty `conftest.py`, so pytest can import the module):

```python
# fix.py: the same agent in Python
import os
import subprocess

from intelli.function.coding_agent import CodingAgent

agent = CodingAgent(
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    provider="anthropic",
    model="claude-sonnet-5",
    workspace="./pricing_py",
    max_iterations=12,
)
result = agent.run(
    "pytest fails. Find the cause in pricing.py and fix it. Do not change the tests.",
    test_command="python -m pytest -q",
)
print(result["success"], result["iterations"], result["summary"])

# no on_action hook in Python, so check what changed afterwards
status = subprocess.run(["git", "status", "--porcelain"], cwd="./pricing_py",
                        capture_output=True, text=True, check=True).stdout
changed = [line[3:] for line in status.splitlines()]
if any(name.startswith("tests/") or name.endswith("conftest.py") for name in changed):
    raise SystemExit(f"The agent changed the tests: {changed}")
```

For a local model, Python reaches Ollama through the `vllm` provider:

```python
agent = CodingAgent(
    provider="vllm",
    model="qwen2.5:0.5b",
    options={"baseUrl": "http://localhost:11434"},  # no /v1, the client adds it
    workspace="./pricing_py",
    max_iterations=8,
)
```

The gate works the same way, the result key is `test_output`, and `chat_fn(system, history)` takes `(role, text)` pairs. Python has no `on_action` hook, so the git check is your guard, and `git status` also catches new files such as a `conftest.py` that skips tests. The 0.5B model failed all four Python runs we tried. Python's `round()` also rounds half to even (`round(498.5)` is 498), a wrong fix only a hidden test would catch. More in the [Python coding agent docs](/docs/python/flows/coding-agent) and [How to Build an AI Agent in Python](/articles/how-to-build-ai-agent-python).

## When to use something bigger

This script is small on purpose, so here is what it doesn't do and which tools do.

[Claude Code and the Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) give you built-in tools, lifecycle hooks, subagents, permissions over which tools run without approval, and sessions you can resume or fork, from Python or TypeScript. Claude Code can also sandbox its shell commands at the operating system level. If your team already works there, on Claude, they're the more complete choice.

Here you get a loop you own: a gate enforced in code, a guard in your own language, and one script for Claude, GPT, Gemini or your own hardware. The gaps: no sandbox, one tool per turn, a single test command and no subagents.

## FAQ

Questions teams ask before they let an agent near a red build.

### Can an AI coding agent run fully local with Ollama?

Yes. `provider: 'ollama'` with a model name needs no key and runs offline. The limit is the model: a 0.5B model passed 1 of 24 runs, so measure a larger one.

### Will the agent edit the tests to make them pass?

It can, and studies show models do. Block test paths in `onAction`, check changed files with git, keep hidden tests in CI, and have a person read the diff.

### How many iterations should a coding agent get?

For one red test, 10 to 15 is a reasonable start, and the CI script uses 15. If runs often hit the cap, sharpen the task before raising it, since each turn costs more than the last.

### Is the bash tool sandboxed?

No. File tools stay in the workspace, but shell commands run as your user. Allowlist commands, delete keys after building the agent, and use a container.

### Can Claude Code use these tools too?

Yes. `claude mcp add intellinode -e OPENAI_API_KEY=sk-... -- npx -y intellinode mcp` gives Claude Code `fix_code` and `review_code` on another provider. The [MCP server docs](/docs/npm/mcp/server) have the details, and note that it reads a `.env` file from the folder it starts in.

## Next step

Start where the guide did, with no key:

```bash
mkdir agent-demo && cd agent-demo
npm i intellinode
# add pricing/, gate-demo.js and fix.js from this guide, then:
node gate-demo.js          # the test gate, no model or key needed
ollama pull qwen2.5:0.5b   # about 400 MB, enough to test the wiring
LLM=ollama node fix.js     # or LLM=anthropic with ANTHROPIC_API_KEY set
```

When both behave, point the guarded `fix.js` at one real red build on a branch, and read the diff yourself.
