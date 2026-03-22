# Cursor Integration

## Setup

Create `.cursor/rules/agent-mind.md` in your project root:

```markdown
## Agent Mind Memory System
This project uses Agent Mind for structured memory management.
At the start of every session, read `.agent-mind/BOOT.md` and follow its protocols.
Use `.agent-mind/workspace/` as working memory for the current task.
After completing a task, follow `.agent-mind/protocols/compaction.md`.
When asked about memory health, follow `.agent-mind/protocols/maintenance.md`.
```

Alternatively, add the snippet to an existing `.cursorrules` file in your project root.

## How It Works

- Cursor reads `.cursor/rules/*.md` and `.cursorrules` at session start
- The snippet points Cursor to the `.agent-mind/` system
- Cursor can read project files, so all `.agent-mind/` content is accessible

## Coexistence

- Cursor has its own rules system and "Memory Bank" community patterns
- Agent Mind provides a more structured approach with explicit protocols
- If you use Cursor's Memory Bank pattern (productContext.md etc.), Agent Mind's `knowledge/` serves a similar but more rigorous purpose
- You can use both — they don't conflict

## Cursor-Specific Tips

- Cursor's composer and chat modes both read rules files
- In composer mode, the full workflow protocol may be too heavy. Consider a lighter version for quick edits.
- Cursor works well with the warm-tier knowledge files — it can load domain patterns alongside your code context
