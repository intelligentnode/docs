---
sidebar_position: 4
title: "AI Code Review Quality Gate for CI in Node.js"
sidebar_label: "Engineering quality gate"
description: "Build a CI quality gate with IntelliNode for PR review, Jest test generation, coding agent fixes, commit messages, and release notes."
keywords: ["node.js quality gate","intellinode ci workflow","ai pull request review","generate jest tests","coding agent test fixes","ai commit message generation"]
---

# Engineering quality gate

Pull requests pile up, reviewers are busy, and the tests that would have caught the regression were never written. A quality gate in CI gives every pull request a first review, a set of unit tests and a clean commit message before a human looks at it, and hands the failing branches to a coding agent that fixes them until the tests pass.

<img src="/img/use-cases/engineering-quality-gate.jpg" width="100%" alt="Code commits passing through a review gate" />

<svg viewBox="0 0 760 200" width="100%" role="img" aria-label="Quality gate pipeline">
  <defs>
    <marker id="qgArrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <path d="M0,0 L10,4 L0,8 z" fill="#64748b" />
    </marker>
  </defs>
  <rect x="15" y="55" width="140" height="80" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
  <text x="85" y="85" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">Pull request</text>
  <text x="85" y="105" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">diff + changed files</text>
  <line x1="155" y1="95" x2="205" y2="95" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#qgArrow)" />
  <rect x="210" y="55" width="150" height="80" rx="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
  <text x="285" y="85" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">review_code</text>
  <text x="285" y="105" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">score and issues</text>
  <text x="285" y="122" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#64748b">generate_unit_tests</text>
  <line x1="360" y1="95" x2="410" y2="95" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#qgArrow)" />
  <rect x="415" y="55" width="150" height="80" rx="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
  <text x="490" y="85" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#0f172a">CodingAgent</text>
  <text x="490" y="105" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#92400e">fixes failing tests</text>
  <text x="490" y="122" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#92400e">on the branch</text>
  <line x1="565" y1="95" x2="620" y2="95" stroke="#059669" strokeWidth="1.5" markerEnd="url(#qgArrow)" />
  <rect x="625" y="55" width="120" height="80" rx="10" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
  <text x="685" y="85" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="600" fill="#065f46">Human review</text>
  <text x="685" y="105" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#059669">report + green tests</text>
  <text x="380" y="175" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="11" fill="#64748b">a different model family reviews the code than the one that wrote it</text>
</svg>

### 1. Review every pull request

`review_code` returns a structured report you can post as a comment or fail the check on. Use a different provider than your team's coding assistant to get an independent opinion.

```javascript
const { Gen } = require('intellinode');
const { execSync } = require('child_process');

const diff = execSync('git diff origin/main...HEAD').toString();

const review = await Gen.review_code(diff, process.env.ANTHROPIC_API_KEY, 'anthropic', { language: 'typescript' });
// { summary, score, issues: [{ severity, title, description, suggestion }] }

const blocking = review.issues.filter((issue) => issue.severity === 'high');
if (blocking.length) {
  console.log(`Blocking issues:\n${blocking.map((issue) => `- ${issue.title}: ${issue.suggestion}`).join('\n')}`);
  process.exitCode = 1;
}
```

### 2. Generate the missing tests

For every new source file without a test, generate one in the framework the repository uses and run it in the same job.

```javascript
const fs = require('fs');
const path = require('path');

const changed = execSync('git diff --name-only origin/main...HEAD').toString().split('\n').filter((file) => /^src\/.*\.js$/.test(file));

for (const file of changed) {
  const testFile = path.join('test', path.basename(file).replace(/\.js$/, '.test.js'));
  if (fs.existsSync(testFile)) continue;

  const code = fs.readFileSync(file, 'utf8');
  const tests = await Gen.generate_unit_tests(code, process.env.OPENAI_API_KEY, 'openai', {
    framework: 'jest',
    modulePath: path.relative('test', file).replace(/\.js$/, ''),
  });
  fs.writeFileSync(testFile, tests);
}

execSync('npx jest --ci', { stdio: 'inherit' });
```

### 3. Let the coding agent fix the failing branch

When the tests fail, the coding agent edits the branch until they pass and reports what it changed. Every file access stays inside the checkout, and the run stops at `maxIterations`.

```javascript
const { CodingAgent } = require('intellinode');

const agent = new CodingAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  provider: 'anthropic',
  model: 'claude-sonnet-5',
  workspace: process.cwd(),
  maxIterations: 15,
  onAction: ({ iteration, tool, args }) => console.log(`#${iteration} ${tool}`, tool === 'write_file' ? args.path : ''),
});

const result = await agent.run('The unit tests fail on this branch. Find the cause and fix it without changing the tests.', {
  testCommand: 'npx jest --ci',
});

if (result.success) {
  const message = await Gen.generate_commit_message(execSync('git diff').toString(), process.env.OPENAI_API_KEY);
  execSync(`git commit -am ${JSON.stringify(message)}`);
  console.log(result.summary);
} else {
  console.log('Needs a human:', result.summary);
}
```

### 4. Release notes from the merged changes

```javascript
const log = execSync('git log --oneline v2.4.0..HEAD').toString();
const notes = await Gen.generate_release_notes(log, process.env.OPENAI_API_KEY, 'openai', { version: '2.5.0' });
fs.writeFileSync('CHANGELOG.next.md', notes);
```

### 5. The same tools inside every developer's assistant

Add the intellinode MCP server to the team's Claude Code, Cursor or VS Code setup and the review, test generation and fix tools are one prompt away, on any provider the company has keys for:

```bash
claude mcp add intellinode -e ANTHROPIC_API_KEY=sk-ant-... -e OPENAI_API_KEY=sk-... -- npx -y intellinode mcp
```

See the [MCP server](../mcp/server) page for the tool list.

### Why it helps

- Every pull request gets a review and tests before a reviewer spends time on it.
- Failing branches come back green with a summary of the fix, ready for the human decision.
- The review runs on a different model family than the code generator, which catches more.
