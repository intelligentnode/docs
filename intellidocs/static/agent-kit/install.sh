#!/bin/sh
# Adds the Intelli agent kit to the current project:
# an AGENTS.md section and one skill that Claude Code and Codex both read.
# Usage: curl -fsSL https://www.intellinode.ai/agent-kit/install.sh | sh
set -e

BASE="${INTELLI_KIT_URL:-https://www.intellinode.ai/agent-kit}"
SKILL_DIR=".agents/skills/intelli-flows"

if [ -f AGENTS.md ] && grep -q "Using Intelli (Python) to build agent flows" AGENTS.md; then
  echo "AGENTS.md already has the Intelli section"
else
  if [ -s AGENTS.md ]; then printf '\n' >> AGENTS.md; fi
  curl -fsSL "$BASE/AGENTS.md" >> AGENTS.md
  echo "Added the Intelli section to AGENTS.md"
fi

mkdir -p "$SKILL_DIR" .claude/skills
curl -fsSL "$BASE/SKILL.md" -o "$SKILL_DIR/SKILL.md"
echo "Saved the skill to $SKILL_DIR/SKILL.md"

if [ ! -e .claude/skills/intelli-flows ]; then
  ln -s "../../$SKILL_DIR" .claude/skills/intelli-flows
  echo "Linked the skill for Claude Code at .claude/skills/intelli-flows"
fi

echo 'Next: pip install -U "intelli[visual]"'
