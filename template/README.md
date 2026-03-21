# Agent Mind

A standalone cognitive memory system for LLM agents. Drop this folder into any project. Any LLM tool (Claude Code, Codex, Gemini CLI, Cursor, or others) can use it to think better, remember what matters, and improve over time.

## What This Is

A folder of markdown files that gives any LLM agent:

- **Structured thinking** — a workflow protocol that ensures understanding before implementation
- **Persistent memory** — knowledge that survives across sessions, organized by domain
- **Learning from experience** — every completed task feeds back into domain knowledge
- **Failure prevention** — known failure patterns are checked before new work begins
- **Self-maintenance** — protocols for checking memory health and preventing degradation
- **Tool agnosticism** — works with any LLM tool that can read files

No databases. No embeddings. No external services. Just `.md` files that any LLM can read.

## Quick Start

1. Copy the `.agent-mind/` folder into your project root
2. Edit `config.md` with your project details
3. Set up your LLM tool's integration (see `adapters/` for your tool)
4. Start working — the agent follows the protocols in `BOOT.md`

## How It Works

The agent reads `BOOT.md` at the start of every session. BOOT.md tells it how to:
- Load relevant knowledge before starting work
- Think critically (check failure patterns, identify unknowns)
- Capture learning after every task
- Maintain memory health over time

### Memory Architecture

Three tiers, mapped to cognitive science:

| Tier | Directory | Temperature | When Loaded |
|------|-----------|-------------|-------------|
| Working memory | `workspace/` | Hot | During active task, cleared after |
| Semantic memory | `knowledge/` | Warm | When domain/tech matches current task |
| Episodic memory | `history/` | Cold | Searched on demand for past context |
| Procedural memory | `protocols/` | Hot | Operating instructions, always available |

### The Learning Loop

1. **Work** → agent follows workflow protocol
2. **Capture** → compaction protocol extracts insights from completed tasks
3. **Accumulate** → insights stored with vote counts, patterns stored by domain
4. **Apply** → next task loads relevant knowledge, including from past work
5. **Maintain** → periodic health checks prune bad memories, promote good ones

This is backed by research: ExpeL (cross-task learning), Reflexion (failure analysis), SimpleMem (quality-gated writes), MemGPT (tiered memory management).

## Directory Structure

```
.agent-mind/
├── BOOT.md              ← Agent entry point (read first, every session)
├── config.md            ← Project settings
├── README.md            ← This file (for humans)
│
├── protocols/           ← HOW the agent operates (procedural memory)
│   ├── workflow.md      ← Thinking & working process
│   ├── memory-ops.md    ← Memory read/write rules
│   ├── compaction.md    ← Post-task learning capture
│   ├── maintenance.md   ← Memory health & cleanup
│   └── quality-gate.md  ← What deserves to be remembered
│
├── knowledge/           ← WHAT the agent knows (semantic memory)
│   ├── domains/         ← Domain expertise (patterns + failures)
│   ├── stack/           ← Technology-specific knowledge
│   └── insights.md      ← Cross-domain learnings with vote counts
│
├── workspace/           ← Current task (working memory, cleared after)
│
├── history/             ← What has happened (episodic memory)
│   ├── episodes/        ← Task summaries + index
│   ├── reflections/     ← Failure analysis
│   └── maintenance-log.md
│
└── adapters/            ← Tool-specific integration
    ├── claude.md        ← Claude Code setup
    ├── codex.md         ← OpenAI Codex setup
    ├── gemini.md        ← Gemini CLI setup
    └── cursor.md        ← Cursor setup
```

## Design Principles

1. **Everything is markdown.** If it can't be a `.md` file, it doesn't belong here.
2. **The structure is the product.** Extend by creating folders and files. No code needed.
3. **Quality over quantity.** Not everything gets remembered. Bad memories poison the system.
4. **Human drives, agent maintains.** The agent proposes; the human decides.
5. **Nothing is deleted, only moved.** History is append-only. Cold storage preserves everything.
6. **Non-disruptive.** Drop in, remove later. No changes to your project files.

## Research Foundation

Built on findings from:
- **Letta/MemGPT:** Filesystem-based memory achieves 74% on LoCoMo (beating Mem0's 68.5% graph DB)
- **Claude Code:** Files under 200 lines achieve >92% instruction adherence
- **ExpeL:** Cross-task insight extraction with vote-based promotion (+31% on ALFWorld)
- **Reflexion:** Self-critique after failure (+22% on AlfWorld, +20% on HotPotQA)
- **SimpleMem:** Quality-gated writes prevent self-degradation (26.4% improvement over Mem0)
- **Xiong et al.:** Naive "remember everything" causes sustained performance decline

## License

MIT — use it, modify it, share it.
