#!/bin/sh
# Adds the Intelli skill to the current project, for Claude Code and Codex.
# The skill is one folder (SKILL.md, its rules in AGENTS.md, and references/agents.md), downloaded
# from plugins/intelli-flows/skills/intelli-flows in the Intelli repository.
# Usage: curl -fsSL https://www.intellinode.ai/agent-kit/install.sh | sh
set -e

BASE="${INTELLI_KIT_URL:-https://raw.githubusercontent.com/intelligentnode/Intelli/main/plugins/intelli-flows/skills/intelli-flows}"
SKILL_DIR=".agents/skills/intelli-flows"

mkdir -p "$SKILL_DIR/references" .claude/skills
curl -fsSL "$BASE/SKILL.md" -o "$SKILL_DIR/SKILL.md"
curl -fsSL "$BASE/AGENTS.md" -o "$SKILL_DIR/AGENTS.md"
curl -fsSL "$BASE/references/agents.md" -o "$SKILL_DIR/references/agents.md"
echo "Saved the skill to $SKILL_DIR (SKILL.md, AGENTS.md, references/agents.md)"

if [ ! -e .claude/skills/intelli-flows ]; then
  ln -s "../../$SKILL_DIR" .claude/skills/intelli-flows
  echo "Linked the skill for Claude Code at .claude/skills/intelli-flows"
fi

if [ -f AGENTS.md ] && grep -q "Using Intelli (Python) to build agent flows" AGENTS.md; then
  echo "Note: your project AGENTS.md has an older Intelli section. The skill now carries its own rules, so you can remove it."
fi

echo 'Next: pip install -U "intelli[visual]"   (version 2.1.1 or above)'
