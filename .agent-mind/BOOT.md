# Agent Mind — Boot Protocol

You have access to a cognitive memory system in `.agent-mind/`. It helps you think better, remember what matters, and improve over time. Read this file first, every session. Non-negotiable.

## Session Start — Complete Before Any Task

Do these now. Each step is a file read — actually open and read the file, do not skip.

1. ✅ Read this file (you're doing it now)
2. **Read `.agent-mind/config.md` NOW.** Open it. It tells you the project name, active domains, stack, and context you need before touching anything. Do not proceed without reading it.
3. **List `.agent-mind/workspace/`.** If files exist, a task is already in progress — resume it before starting anything new. If empty, continue.
4. **Read `.agent-mind/knowledge/insights.md`.** These are your accumulated learnings across all past tasks. Absorb them before working.

Only after completing steps 2-4 are you ready to work. If you skip these, you will miss context and make avoidable mistakes.

## When You Receive a Task

First, gauge the size: **quick** (under 30 min), **medium** (1-4 hours), or **large** (multi-day). This determines how much ceremony to apply. Not every task needs every step.

Then follow `.agent-mind/protocols/workflow.md`. The core phases:

1. **Understand** — What is actually being asked? What's the real goal?
   - Quick: hold in your head. Medium/Large: write to `workspace/task.md`.
2. **Load context** — List `knowledge/domains/` and `knowledge/stack/` to check for relevant knowledge. Check `history/episodes/_index.md` for related past work.
   - Quick: read matching files, note what you found. Medium/Large: write what you loaded to `workspace/context.md`.
3. **Think critically** — What could go wrong? Check failure libraries in matched domains. Identify unknowns.
   - **BLOCKING unknowns = HALT.** Surface these to the human. Do not guess on things that matter. For medium/large tasks, write them to `workspace/questions.md`.
   - Assumable unknowns: note your assumption. For medium/large tasks, write to `workspace/assumptions.md`.
4. **Work** — Only after unknowns are resolved. For medium/large tasks, log decisions to `workspace/decisions.md`.
5. **Capture** — Follow `protocols/compaction.md`. Create episode record. For knowledge writes, apply quality gate. Clear workspace if used.

## What Always Happens (Any Task Size)

These are not optional, not even for quick tasks:

1. **Session Start files** — Read `config.md` and `knowledge/insights.md` before doing any work.
2. **Check existing knowledge** — Before creating or writing to any domain in `knowledge/domains/`, list what's already there. Read matching domains. Do not create something that already exists.
3. **Quality gate** — Before ANY write to `knowledge/`, apply `protocols/quality-gate.md`. Every write, every time.
4. **Episode index entry** — After every task, append a one-line entry to `history/episodes/_index.md`.
5. **Append-only history** — Never delete anything in `history/`. Only add.

## What Scales With Task Size

These grow with the task:

- **Workspace files** — Quick tasks: optional. Medium/large: required.
- **Episode detail files** — Quick: index entry only. Medium/large: full `history/episodes/YYYY-MM/[slug].md` file.
- **Reflection files** — Only for failed tasks.
- **Insights extraction** — Quick: skip unless something genuinely novel. Medium/large: always check `knowledge/insights.md`.

## Rules That Never Bend

1. **Never implement before clarity.** If you don't understand what you're building, stop and ask.
2. **BLOCKING unknowns = HALT.** Ask the human. Do not guess on things that matter.
3. **Capture after every task.** At minimum: one-line episode index entry.
4. **Never delete history.** Files in `history/` are append-only. Never delete, only add.
5. **Gate your writes.** Before writing to `knowledge/`, check `protocols/quality-gate.md`. Bad memories poison the system.
6. **Stay concise.** Keep protocol files under 200 lines. Keep knowledge files focused.

## Memory System

Your memory has three temperatures:

**Hot (always loaded):** This file, `config.md`, files in `protocols/`. Loaded every session.

**Warm (loaded by relevance):** `knowledge/domains/`, `knowledge/stack/`, `knowledge/insights.md`. Load based on what the current task needs.

**Cold (searched on demand):** `history/episodes/`, `history/reflections/`. Search when you need historical context or failure analysis.

## Self-Maintenance

You are not autonomous. You think, then propose. The human decides.

**Trigger:** At session start, check `history/maintenance-log.md`. If the last entry is more than 2 weeks old (or no entries exist and `history/episodes/_index.md` has 5+ entries), suggest: "Memory maintenance is due. Want me to run a health check?"

Follow `protocols/maintenance.md` when triggered.

## Adapters

If you are Claude Code, also read `.agent-mind/adapters/claude.md`.
If you are Codex / OpenAI Agents, also read `.agent-mind/adapters/codex.md`.
If you are Gemini CLI, also read `.agent-mind/adapters/gemini.md`.
If you are Cursor, also read `.agent-mind/adapters/cursor.md`.

## Extending This System

- **New domain knowledge?** Create `knowledge/domains/[name]/` with `patterns.md` and `failures/_index.md`.
- **New tech stack knowledge?** Create `knowledge/stack/[tech].md`.
- **Custom protocols?** Add `.md` files to `protocols/`.

The structure is the product. Extend it by creating markdown files.
