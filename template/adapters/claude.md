# Claude Code Integration

## Setup

Add this block to your project's `CLAUDE.md`:

```markdown
## Agent Mind Memory System
This project uses Agent Mind for structured memory management.
At the start of every session, read `.agent-mind/BOOT.md` and follow its protocols.
Use `.agent-mind/workspace/` as working memory for the current task.
After completing a task, follow `.agent-mind/protocols/compaction.md`.
When asked about memory health, follow `.agent-mind/protocols/maintenance.md`.
```

## How It Works

- Claude Code reads `CLAUDE.md` at session start — that's its native instruction file
- The snippet above makes Claude Code aware of the `.agent-mind/` system
- Claude Code can read arbitrary files, so all `.agent-mind/` content is accessible
- Keep the CLAUDE.md snippet under 10 lines — it just points to BOOT.md for details

## Coexistence With Claude's Native Memory

Claude Code has its own memory systems:
- `~/.claude/CLAUDE.md` — user-level preferences
- `.claude/rules/*.md` — glob-matched rules
- `~/.claude/projects/[hash]/memory/` — auto-memory

Agent Mind complements these:
- Claude's auto-memory: session-level, unstructured, tool-specific
- Agent Mind: project-level, structured (episodic/semantic/procedural), tool-agnostic

They don't conflict. Use both. Claude's auto-memory handles session continuity. Agent Mind handles structured learning and cross-tool knowledge.

## Claude-Specific Tips

- Claude Code follows instructions in CLAUDE.md ~92% of the time for files under 200 lines
- All Agent Mind protocol files are kept under 200 lines for this reason
- Claude responds well to clear, imperative instructions ("read X", "write to Y", "HALT if Z")
- The BOOT.md and protocol files are written in this style deliberately
- Claude's `/compact` command resets context but re-reads CLAUDE.md from disk — Agent Mind survives compaction

## Recommended CLAUDE.md Structure

```markdown
# Project Instructions

## Agent Mind
[snippet above]

## Project-Specific Rules
[your existing CLAUDE.md rules]
```

Put the Agent Mind block early in CLAUDE.md so it gets high attention from the model.
