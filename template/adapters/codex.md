# OpenAI Codex / Agents Integration

## Setup

Add this block to your project's `AGENTS.md`:

```markdown
## Agent Mind Memory System
This project uses Agent Mind for structured memory management.
At the start of every session, read `.agent-mind/BOOT.md` and follow its protocols.
Use `.agent-mind/workspace/` as working memory for the current task.
After completing a task, follow `.agent-mind/protocols/compaction.md`.
When asked about memory health, follow `.agent-mind/protocols/maintenance.md`.
```

## How It Works

- Codex CLI reads `AGENTS.md` at session start — that's its native instruction file
- The snippet makes Codex aware of the `.agent-mind/` system
- Codex can read files from the filesystem, so all `.agent-mind/` content is accessible

## Coexistence

- Codex has its own context management via AGENTS.md
- Agent Mind adds structured memory on top — they complement each other
- Agent Mind's `knowledge/` persists across Codex sessions
- Codex's native context resets each session; Agent Mind's doesn't

## Codex-Specific Tips

- Codex in `--full-auto` mode may skip some protocol steps. Consider running without `--full-auto` for tasks that benefit from the full thinking workflow
- For code execution tasks, the workflow's Phase 3 (Think Critically) is especially valuable — Codex tends to jump straight to implementation
- Keep AGENTS.md snippets concise. Codex's instruction adherence improves with shorter, clearer instructions
