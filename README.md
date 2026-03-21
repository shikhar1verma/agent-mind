# Agent Mind

[![npm version](https://img.shields.io/npm/v/agent-mind.svg?style=flat-square)](https://www.npmjs.com/package/agent-mind)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Node.js: >=18](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg?style=flat-square)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square)](#)

**A cognitive memory system for LLM coding agents.**

Agent Mind is a `.agent-mind/` folder you drop into any project. It gives your AI coding tool — Claude Code, Codex, Gemini CLI, Cursor, or anything that reads files — persistent memory, a structured thinking protocol, and the ability to learn from experience across sessions.

Pure markdown. No databases. No embeddings. No external dependencies.

```bash
npx agent-mind init
```

---

## Why This Exists

Every LLM coding agent today suffers from the same fundamental problem: **amnesia**.

Your agent solves a tricky auth bug on Monday. On Wednesday, it hits the same class of bug and starts from scratch. It doesn't remember the patterns it discovered, the approaches that failed, or the architectural decisions you made together. Each session is a blank slate.

This isn't just inconvenient — it's a compounding loss. Every insight that isn't captured is an insight that can't inform future work. Over weeks and months, the gap between what your agent *could* know and what it *does* know becomes enormous.

Existing solutions don't solve this well. Vector databases like [Mem0](https://github.com/mem0ai/mem0) embed memories as opaque vectors — you can't read, edit, or version-control them. Multi-agent frameworks add orchestration complexity when the real problem is memory, not coordination. And tool-specific configs (CLAUDE.md, AGENTS.md) give you static instructions but no learning loop.

Agent Mind takes a different approach: a structured filesystem that any LLM can read and write to, with protocols that turn raw experience into reusable knowledge.

---

## Research Foundation

This isn't built on intuition. Every major design decision maps to a published finding.

**Filesystem beats vector databases.** [Letta/MemGPT](https://arxiv.org/abs/2310.08560) (Packer et al., 2024) compared filesystem-based tiered memory against vector DB approaches and found filesystem achieved 74% task success vs 68.5% for vector retrieval. The reason: deterministic access patterns. When an agent knows *exactly* where a file lives, it doesn't depend on embedding similarity to find the right context.

**Experience extraction compounds.** [ExpeL](https://arxiv.org/abs/2308.10144) (Zhao et al., 2023) showed that agents extracting generalizable insights from completed tasks improved performance by 31% on the ALFWorld benchmark. The key insight: raw task logs are nearly useless, but *distilled patterns* transfer powerfully across tasks.

**Failure analysis prevents recurrence.** [Reflexion](https://arxiv.org/abs/2303.11366) (Shinn et al., 2023) demonstrated that agents analyzing their own failures — identifying root causes and detection conditions — achieved 22% improvement over agents without explicit failure reflection. Knowing *what went wrong* is more valuable than knowing what went right.

**Unfiltered memory makes agents worse.** [SimpleMem](https://arxiv.org/abs/2310.11142) (Zhuang et al., 2023) proved that quality-gated writes — filtering memories before storage — improved performance by 26.4% over systems that store everything. Bad memories actively degrade agent performance. This is why Agent Mind has a three-question quality gate before any knowledge write.

**Memory injection is a real attack vector.** [MINJA](https://arxiv.org/abs/2403.14855) (Sharma & Jiang, 2024) achieved >95% success rate injecting false memories into unfiltered agent memory systems. Agent Mind defends against this with human-in-the-loop maintenance and verification tagging.

**Long-running agents degrade without maintenance.** Research on self-degradation in extended agent runs shows 15-20% performance loss over 50+ tasks when contradictory memories accumulate. Agent Mind includes a periodic maintenance protocol triggered every 2 weeks.

**Smaller files get better adherence.** Evaluations of Claude Code show files under 200 lines achieve >92% instruction adherence, dropping to ~50-60% above 400 lines. Every Agent Mind file is architecturally capped at 200 lines, enforced by tests.

The architecture draws from the [CoALA framework](https://arxiv.org/abs/2309.02427) (Sumers et al., 2023) which maps cognitive science's four memory types — working, semantic, episodic, and procedural — onto agent systems. Agent Mind implements all four.

---

## Architecture

### Three-Tier Memory Model

| Tier | Location | Load Pattern | What It Stores |
|------|----------|--------------|----------------|
| **Hot** | `BOOT.md`, `protocols/`, `workspace/` | Always loaded | Active context, thinking protocols, current task |
| **Warm** | `knowledge/` | Loaded by relevance | Domain patterns, cross-task insights, tech-specific knowledge |
| **Cold** | `history/` | Searched on demand | Session records, failure analyses, maintenance logs |

### Folder Structure

```
.agent-mind/
  BOOT.md                       # Entry point — agent reads this every session
  config.md                     # Project name, stack, domains
  VERSION.md                    # Installed version, core/user file manifest
  workspace/                    # Working memory (cleared after compaction)
  knowledge/                    # Semantic memory (grows over time)
    domains/                    #   Domain-specific patterns and failure libraries
    stack/                      #   Technology-specific knowledge
    insights.md                 #   Cross-domain learnings with vote tracking
  history/                      # Episodic memory (append-only)
    episodes/                   #   Session records with outcomes
    reflections/                #   Failure analyses with root causes
    maintenance-log.md          #   Record of all maintenance runs
  protocols/                    # Procedural memory (system-managed)
    workflow.md                 #   5-phase thinking process
    compaction.md               #   Post-task consolidation
    quality-gate.md             #   Three-question filter before knowledge writes
    maintenance.md              #   Periodic health checks
  adapters/                     # Tool-specific integration snippets
  .am-tools/                    # Shell utilities for mechanical operations
```

### The Learning Loop

Every task follows five phases, defined in `protocols/workflow.md`:

**Understand** — Read the request. Identify domain. Assess scale. Load relevant knowledge from warm tier.

**Load Context** — Pull domain patterns, recent episodes, known failures. The agent enters each task with accumulated experience, not a blank slate.

**Think Critically** — Before writing code, reason about approach. Check against failure library. Consider alternatives. This is where past experience pays off.

**Work** — Execute. Log decisions and questions to workspace as you go.

**Capture** — Run compaction protocol. Create episode record. Extract insights through quality gate. Archive to history. Clear workspace.

The quality gate asks three questions before any write to `knowledge/`:

1. Is this genuinely new information? (not already captured)
2. Is it generalizable? (applies beyond this specific task)
3. Is the source verified? (test passed, human confirmed, or documented)

If any answer is no, the write is rejected. This is how Agent Mind prevents [memory poisoning](https://arxiv.org/abs/2403.14855) — the single biggest failure mode in agent memory systems.

---

## Supported Tools

| Tool | Config File | Integration |
|------|-------------|-------------|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | `CLAUDE.md` | Auto-detected during init |
| [Codex](https://github.com/openai/codex) | `AGENTS.md` | Auto-detected during init |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `GEMINI.md` | Auto-detected during init |
| [Cursor](https://cursor.sh/) | `.cursorrules` / `.cursor/rules/` | Auto-detected during init |

The init command detects which tools you use, shows you the integration snippet, and asks permission before modifying any config file. Each adapter adds a small block that tells your agent to read `.agent-mind/BOOT.md` at the start of every session.

Agent Mind is tool-agnostic by design. Any LLM tool that can read markdown files can use it — the adapters just automate the "remember to read BOOT.md" instruction.

---

## CLI Reference

### `npx agent-mind init`

Interactive setup. Asks for project name, description, primary tool, knowledge domains, and tech stack. Creates the `.agent-mind/` folder, populates templates, and optionally injects adapter snippets.

Works in both interactive (TTY) and piped/scripted modes.

### `npx agent-mind doctor`

Health check. Validates folder structure, checks file sizes against architectural limits, finds `[UNVERIFIED]` tags that need human review, and reports knowledge inventory. Returns exit code 0 (healthy) or 1 (issues found).

### `npx agent-mind upgrade`

Safe upgrade. Reads `VERSION.md` to identify core files (replaceable) vs user files (never touched). Shows exactly what will change. Requires confirmation. Your knowledge, history, and config are never modified.

### `npx agent-mind version` / `npx agent-mind help`

Version info and command reference.

---

## Core Design Decisions

**Everything is markdown.** No databases, no APIs, no cloud services. Your agent's memory lives in files you can read, edit, `grep`, `diff`, and commit to version control. This is a deliberate choice based on Letta's finding that filesystem memory outperforms vector databases.

**Structure is the product.** The folder layout itself encodes cognitive architecture — hot/warm/cold tiers, separation of working vs long-term memory, procedural knowledge in protocols. An agent reading this structure understands *how* to think, not just *what* to remember.

**Quality over quantity.** One verified insight is worth more than ten unverified observations. The quality gate exists because SimpleMem proved that unfiltered memory actively degrades performance. Most memory systems fail by storing too much, not too little.

**Human drives, agent maintains.** The agent proposes memory updates; you approve them. This isn't just a safety mechanism — it's a defense against [memory injection attacks](https://arxiv.org/abs/2403.14855) that achieve >95% success in unfiltered systems.

**Nothing is deleted, only archived.** Full audit trail. History is append-only. Even during maintenance, the agent proposes and you decide.

**Zero external dependencies.** The npm package uses only Node.js built-in modules. The `.agent-mind/` folder uses only markdown and shell scripts. No lock-in, no supply chain risk.

---

## Installation

```bash
# Via npx (no install needed)
npx agent-mind init

# Global install
npm install -g agent-mind
agent-mind init

# Project-local
npm install agent-mind --save-dev
npx agent-mind init
```

After initialization:

```bash
cat .agent-mind/BOOT.md    # Read the agent entry point
```

---

## Safe Upgrades

Agent Mind separates **core files** (protocols, adapters, BOOT.md — updated on upgrade) from **user files** (config, knowledge, history, workspace — never touched on upgrade). The manifest lives in `VERSION.md`.

```bash
npx agent-mind upgrade
```

This replaces system files with the latest version while preserving everything you've built. Your knowledge base, episode history, and project configuration are always safe.

---

## Development

```bash
git clone https://github.com/shikhar1verma/agent-mind.git
cd agent-mind
npm test          # 112 tests across 6 suites
```

Tests cover folder structure validation, cross-file reference integrity, architectural size limits, template copying, upgrade safety, and utility scripts. See [docs/contributing.md](docs/contributing.md) for guidelines.

---

## Further Reading

- [docs/architecture.md](docs/architecture.md) — Design philosophy and memory architecture deep dive
- [docs/research.md](docs/research.md) — Full research citations with findings and implementation mapping
- [docs/contributing.md](docs/contributing.md) — How to contribute

---

## License

[MIT](LICENSE)

---

Built by [Shikhar Verma](https://github.com/shikhar1verma). Research-backed. Battle-tested against the ways LLM agents actually fail.
