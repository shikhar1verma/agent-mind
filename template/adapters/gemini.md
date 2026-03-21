# Gemini CLI Integration

## Setup

Add this block to your project's `GEMINI.md`:

```markdown
## Agent Mind Memory System
This project uses Agent Mind for structured memory management.
At the start of every session, read `.agent-mind/BOOT.md` and follow its protocols.
Use `.agent-mind/workspace/` as working memory for the current task.
After completing a task, follow `.agent-mind/protocols/compaction.md`.
When asked about memory health, follow `.agent-mind/protocols/maintenance.md`.
```

## How It Works

- Gemini CLI reads `GEMINI.md` at session start
- The snippet points Gemini to the `.agent-mind/` system
- Gemini CLI can read files from the filesystem, so all content is accessible

## Coexistence

- Gemini CLI has its own instruction system via GEMINI.md
- Agent Mind provides structured persistent memory that Gemini lacks natively
- Particularly valuable for Gemini since its native memory across sessions is limited

## Gemini-Specific Tips

- Gemini's instruction following varies by model tier. Gemini Pro follows protocols well. Flash may skip steps.
- Keep the GEMINI.md snippet short — let BOOT.md handle the detailed instructions
- Gemini handles structured markdown well. The format of Agent Mind files is compatible.
