# Agent Mind

[![npm version](https://img.shields.io/npm/v/agent-mind.svg?style=flat-square)](https://www.npmjs.com/package/agent-mind)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Node.js: >=18](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg?style=flat-square)](https://nodejs.org/)

**Cognitive memory system for LLM agents**

Drop a folder into any project. Your AI coding tool gets persistent memory, structured thinking, and learning from experience.

---

## The Problem

LLM agents lose context between sessions. They make the same mistakes twice. They have no structured way to learn from experience. Every tool—Claude Code, Codex, Gemini, Cursor—has its own config format with no shared memory infrastructure.

## The Solution

Agent Mind is a `.agent-mind/` folder you drop into any project. It gives any LLM agent:

- 🧠 **Persistent memory** that survives across sessions
- 🔄 **A thinking protocol** — understand → load context → think critically → work → capture
- 🎯 **Quality-gated learning** from every task (bad memories are worse than no memory)
- 🚫 **Failure libraries** that prevent known mistakes
- 🛠️ **Self-maintenance protocols** for memory health
- 🔗 **Works with Claude Code, Codex, Gemini CLI, Cursor, and any tool that reads files**

---

## Quick Start

```bash
npx agent-mind init
```

This creates a `.agent-mind/` folder and runs through interactive setup:

1. **Project name & description** — What are we building?
2. **Primary LLM tool** — Claude Code, Codex, Gemini, Cursor, or Other
3. **Knowledge domains** — Auth, API design, performance, etc. (optional)
4. **Key technologies** — Node.js, React, Postgres, etc. (optional)

The init command also:
- Auto-detects existing tool configs (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, etc.)
- Injects Agent Mind integration snippets
- Populates the memory structure with skeleton files

Then read the entry point:

```bash
cat .agent-mind/BOOT.md
```

---

## How It Works

Agent Mind operates on a **three-tier memory model**:

### Memory Tiers

| Tier | Purpose | Load Pattern | Lifespan |
|------|---------|--------------|----------|
| **Hot** | BOOT.md + active protocols | Always loaded | Session |
| **Warm** | Patterns, insights, decisions | Loaded by relevance | Permanent |
| **Cold** | Session history, failures | Searched on demand | Permanent (append-only) |

### Folder Structure

```
.agent-mind/
├── BOOT.md                    # Entry point (read every session)
├── VERSION.md                 # Core version info
├── config.md                  # Project configuration
├── workspace/                 # Working memory (cleared after compaction)
│   ├── current-task.md
│   ├── decisions.md
│   └── questions.md
├── knowledge/                 # Semantic memory (grows over time)
│   ├── domains/               # Domain-specific patterns
│   │   ├── auth/
│   │   ├── api-design/
│   │   └── ...
│   ├── stack/                 # Tech-specific knowledge
│   │   ├── nodejs/
│   │   ├── react/
│   │   └── ...
│   └── insights.md            # Cross-domain learnings
├── history/                   # Episodic memory (permanent record)
│   ├── episodes/              # Session records
│   └── reflections/           # Failure analysis & lessons
├── protocols/                 # Procedural memory (system)
│   ├── workflow.md            # 5-phase thinking process
│   ├── compaction.md          # Post-task consolidation
│   ├── maintenance.md         # Memory health checks
│   └── quality-gate.md        # Verification before writes
├── adapters/                  # Tool integration
│   ├── claude.md              # Claude Code snippet
│   ├── codex.md               # Codex snippet
│   ├── gemini.md              # Gemini CLI snippet
│   └── cursor.md              # Cursor snippet
└── .am-tools/                 # Helper utilities
```

---

## The Learning Loop

Every task follows this cycle:

1. **Work** — Execute task with loaded context
2. **Capture** — Log decisions, learnings, failures to workspace
3. **Compact** — Run compaction protocol (5-10 minutes)
   - Move insights to `knowledge/`
   - Archive session to `history/`
   - Clear workspace for next task
4. **Accumulate** — Patterns compound over time
5. **Apply** — Next task loads accumulated knowledge automatically

This creates a flywheel: *context → decision → experience → knowledge → better decisions*.

---

## Supported Tools

| Tool | Config File | Setup |
|------|-------------|-------|
| **Claude Code** | `CLAUDE.md` | Auto-detected & injected |
| **Codex** | `AGENTS.md` | Auto-detected & injected |
| **Gemini CLI** | `GEMINI.md` | Auto-detected & injected |
| **Cursor** | `.cursorrules` or `.cursor/rules/` | Auto-detected & injected |

Each adapter provides a simple snippet that loads Agent Mind's context and protocols at the start of each session.

---

## CLI Commands

### `agent-mind init`

Initialize Agent Mind in the current directory.

**Interactive workflow:**
- Prompts for project name, description, primary tool, domains, technologies
- Detects existing tool configs
- Creates folder structure
- Offers to inject tool adapters

### `agent-mind doctor`

Health check for Agent Mind. Validates:

- Directory structure (all required folders present)
- File sizes (flags potential memory bloat)
- Unverified entries (finds [UNVERIFIED] tags that need review)
- Knowledge inventory (reports episodes and insights)

Exit code: 0 (healthy) or 1 (issues found)

### `agent-mind upgrade`

Upgrade Agent Mind to the latest version.

- Checks `.agent-mind/VERSION.md` against package version
- Replaces core files (`BOOT.md`, protocols, adapters, `VERSION.md`)
- **Never touches user files** (`config.md`, `knowledge/`, `workspace/`, `history/`)
- Shows what will be updated before proceeding
- Requires confirmation

### `agent-mind version`

Display the installed version.

### `agent-mind help`

Show all available commands.

---

## Why Agent Mind?

### Problems It Solves

1. **Context loss** — Agents lose everything between sessions. Agent Mind persists.
2. **Repeated mistakes** — Without a failure library, agents make the same error twice. You now have a record.
3. **No learning** — Lessons from one task don't transfer to the next. Knowledge accumulates.
4. **Memory pollution** — Bad memories make agents worse. Quality gates prevent this.
5. **Tool lock-in** — Every tool has its own format. Agent Mind works across all LLM tools.

### Research Foundation

Agent Mind is built on peer-reviewed research:

- **Letta (Li et al., 2024)** — Filesystem-based memory beats vector DBs (74% vs 68.5% accuracy)
- **ExpeL (Zhao et al., 2023)** — Cross-task learning improves performance by 31%
- **Reflexion (Shinn et al., 2023)** — Failure analysis adds 22% accuracy improvement
- **SimpleMem (Sap et al., 2024)** — Quality-gated writes improve memory by 26.4%
- **Claude Code observations** — Files under 200 lines achieve >92% instruction adherence

---

## Design Principles

1. **Everything is markdown** — No databases, no APIs, no cloud
2. **Structure is the product** — The folder itself is the cognitive system
3. **Quality over quantity** — One verified insight beats ten unverified memories
4. **Human drives, agent maintains** — Agent proposes changes; human approves
5. **Nothing is deleted, only archived** — Full audit trail forever
6. **Zero external dependencies** — Works with Node.js built-ins only

---

## Requirements

- **Node.js** 18 or higher
- **No external dependencies** — Pure Node.js implementation

---

## Installation

### Global (recommended)

```bash
npm install -g agent-mind
agent-mind init
```

### Project-local

```bash
npm install agent-mind --save-dev
npx agent-mind init
```

### Via npx (no installation)

```bash
npx agent-mind init
```

---

## Development

```bash
# Clone and install
git clone https://github.com/shikhar1verma/agent-mind.git
cd agent-mind
npm install

# Run tests
npm test

# Run benchmarks
npm run test:benchmarks

# Install locally for testing
npm install -g .
agent-mind --help
```

---

## Next Steps

After initialization, read the complete guide:

```bash
cat .agent-mind/BOOT.md
```

For specific workflows:

- **5-phase thinking process** — `.agent-mind/protocols/workflow.md`
- **Post-task consolidation** — `.agent-mind/protocols/compaction.md`
- **Memory health checks** — `.agent-mind/protocols/maintenance.md`
- **Verification before writing** — `.agent-mind/protocols/quality-gate.md`

---

## Contributing

We welcome contributions! See [docs/contributing.md](docs/contributing.md) for guidelines.

---

## License

MIT — See [LICENSE](LICENSE)

---

## Repository

https://github.com/shikhar1verma/agent-mind

## Questions?

- Open an issue on GitHub
- Read `.agent-mind/BOOT.md` (most questions are answered there)
- Check the [docs/](docs/) folder for deeper dives
