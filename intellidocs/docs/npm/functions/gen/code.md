---
sidebar_position: 5
---

# Code quality

Tests, reviews, fixes and the documents around a change. Have a different model write the tests than the one that wrote the code.

### generate_unit_tests

```javascript
const tests = await Gen.generate_unit_tests(code, apiKey, provider, { framework: 'jest', modulePath: './math' });
```

A test file for the code. Options: `framework` (`jest` default, `vitest`, `mocha`, `pytest`), `modulePath` (import path of the module under test).

### review_code

```javascript
const review = await Gen.review_code(code, apiKey, provider, { language: 'javascript' });
// { summary, score, issues: [{ severity, title, description, suggestion }] }
```

### fix_code

```javascript
const fix = await Gen.fix_code(code, apiKey, provider, { problem: 'average([1,2,3]) returns NaN' });
// { code, explanation, changes: [...] }
```

Pass the error message or a description of the wrong behaviour as `problem`.

### explain_code

```javascript
const explained = await Gen.explain_code(code, apiKey, provider, { audience: 'junior developer' });
```

Markdown explanation. Options: `language`, `audience`.

### convert_code

```javascript
const ts = await Gen.convert_code(code, apiKey, provider, { from: 'JavaScript', to: 'TypeScript' });
```

Converts between languages or frameworks and returns the code only.

### generate_commit_message

```javascript
const message = await Gen.generate_commit_message(gitDiff, apiKey, provider, { style: 'conventional' });
```

### generate_readme

```javascript
const readme = await Gen.generate_readme('intellinode-cli: generates web components from a prompt', apiKey);
```

README content in Markdown for a project description.

### generate_release_notes

```javascript
const notes = await Gen.generate_release_notes(changes, apiKey, provider, { version: '2.4.0' });
```

Release notes in Markdown from a list of changes or a diff.

### Beyond one call

For tasks that need several edits and a test run, use the [Coding agent](../../agents/coding-agent): it works inside a repository until the test command passes.
