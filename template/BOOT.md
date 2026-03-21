# Agent Mind — Boot Protocol

You have access to a cognitive memory system in `.agent-mind/`. It helps you think better, remember what matters, and improve over time. Read this file first, every session. Non-negotiable.

## Session Start

1. Read this file (you're doing it now)
2. Read `.agent-mind/config.md` for project context
3. Check `.agent-mind/workspace/` — if files exist, a task is in progress. Resume it.
4. Scan `.agent-mind/knowledge/insights.md` for accumulated learnings
5. You're now ready to work

## When You Receive a Task

Follow `.agent-mind/protocols/workflow.md`. The short version:

1. **Understand** — What is actually being asked? What's the real goal?
2. **Load context** — Check `knowledge/domains/` and `knowledge/stack/` for relevant knowledge. Check `knowledge/insights.md`. Check `history/episodes/_index.md` for related past work.
3. **Think critically** — What could go wrong? Check failure libraries in matched domains. Identify unknowns. Write BLOCKING unknowns to `workspace/questions.md` and HALT.
4. **Work** — Only after unknowns are resolved. Log decisions to `workspace/decisions.md`.
5. **Capture** — Follow `protocols/compaction.md`. Summarize, extract insights, clear workspace.

## Rules That Never Bend

1. **Never implement before clarity.** If you don't understand what you're building, stop and ask.
2. **BLOCKING unknowns = HALT.** Write them to `workspace/questions.md`. Ask the human. Do not guess on things that matter.
3. **Capture after every task.** Follow `protocols/compaction.md` to consolidate learning.
4. **Never delete history.** Files in `history/` are append-only. Never delete, only add.
5. **Gate your writes.** Before writing to `knowledge/`, check `protocols/quality-gate.md`. Not everything deserves to be remembered. Bad memories poison the system.
6. **Stay concise.** Keep this file and all `protocols/` files under 200 lines.

## Memory System

Your memory has three temperatures:

**Hot (always loaded):** This file, `config.md`, files in `protocols/`. Your operating system. Loaded every session.

**Warm (loaded by relevance):** `knowledge/domains/`, `knowledge/stack/`, `knowledge/insights.md`. Load these based on what the current task needs. Don't load everything — load what's relevant.

**Cold (searched on demand):** `history/episodes/`, `history/reflections/`. Search when you need historical context, past decisions, or failure analysis.

## Self-Maintenance

You are not autonomous. You think, then propose. The human decides.

**Trigger:** At session start, check `history/maintenance-log.md`. If the last entry is more than 2 weeks old (or no entries exist and `history/episodes/_index.md` has 5+ entries), suggest to the human: "Memory maintenance is due. Want me to run a health check?"

When running maintenance, follow `protocols/maintenance.md` to:
- Check memory health (stale insights? growing too large? contradictions?)
- Flag memories you're uncertain about
- Propose cleanup actions to the human
- Report on what's working and what's not

If you notice something wrong with your memory during normal work — a pattern that led you astray, an insight that contradicts evidence — flag it immediately. Don't wait for scheduled maintenance.

## Adapters

If you are Claude Code, also read `.agent-mind/adapters/claude.md`.
If you are Codex / OpenAI Agents, also read `.agent-mind/adapters/codex.md`.
If you are Gemini CLI, also read `.agent-mind/adapters/gemini.md`.
If you are Cursor, also read `.agent-mind/adapters/cursor.md`.

These contain tool-specific integration instructions.

## Extending This System

- **New domain knowledge?** Create a folder in `knowledge/domains/[name]/` with `patterns.md` and `failures/_index.md`. See `knowledge/domains/_template/` for the format.
- **New tech stack knowledge?** Create `knowledge/stack/[tech].md`. See `knowledge/stack/_template.md`.
- **Custom protocols?** Add `.md` files to `protocols/`. Reference them from this file or from workflow.md.

The structure is the product. Extend it by creating markdown files.
