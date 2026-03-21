# Agent Mind Architecture

## Design Philosophy

Agent Mind is built on a core principle: **structure is the product**. Everything is markdown. There are no databases, no vector stores, no special file formats. The cognitive memory system is a folder structure that your LLM agent navigates.

This approach is grounded in research findings. MemGPT (Letta) demonstrated that filesystem-based tiered memory achieves 74% task success vs. vector database approaches (Mem0: 68.5%). The filesystem provides:

- **Deterministic navigation** — An agent can find what it needs without embedding similarity searches
- **Human-readability** — Every memory file is plain markdown that humans can read, audit, and debug
- **Durability** — Git-friendly, searchable, mergeable, diff-able
- **Simplicity** — No hidden state, no black-box similarity computations

## Memory Architecture

Agent Mind uses **three temperature tiers** of memory:

### Hot Memory (Always Loaded)
Files that load every session:
- `BOOT.md` — Startup protocol and rules
- `config.md` — Project context
- `protocols/` — Operating procedures (workflow, quality-gate, compaction, etc.)

These are your operating system. Kept small (<200 lines each) to respect Claude's fast token reading.

### Warm Memory (Loaded by Relevance)
Loaded based on what the current task needs:
- `knowledge/domains/` — Domain-specific patterns and failure libraries
- `knowledge/stack/` — Technology-specific knowledge
- `knowledge/insights.md` — Accumulated learnings across all tasks

The agent decides what to load based on task relevance. This avoids context bloat while ensuring patterns that matter are available.

### Cold Memory (Searched on Demand)
Append-only historical records:
- `history/episodes/` — Task summaries (what was done, what was learned)
- `history/reflections/` — Failure analysis and root cause investigations
- `history/maintenance-log.md` — System health checks and cleanup records

These are searched when historical context is needed. They grow over time but don't load into every session.

## Why <200 Lines per File?

Research on Claude Code found that when files exceed 200 lines, rule adherence drops from 92% to ~70%. Smaller files:
- Are faster to read and comprehend
- Have clearer scope
- Are easier to modify without introducing errors
- Keep the cognitive load manageable

This architectural constraint is validated by tests in `tests/sizes.test.js`.

## The Learning Loop

The learning loop is the mechanism that makes the system improve over time. It runs after every completed task and follows `protocols/compaction.md`:

```
Task Completion
    ↓
Step 1: Create Episode Summary
    ↓
Step 2: Pass Through Quality Gate
    ├─ Is it new?
    ├─ Is it generalizable?
    └─ Was it verified?
    ↓
Step 3: Extract Learnings
    ├─ Confirm or add insights
    ├─ Add patterns to domain
    ├─ Promote high-confidence insights
    └─ Log failures and root causes
    ↓
Step 4: Clear Workspace
    ↓
Memory System Grows
```

This loop is grounded in three research approaches:

1. **ExpeL** (cross-task learning): Extracts generalizable experience across tasks and re-uses it. Achieves +31% improvement on ALFWorld benchmark.

2. **Reflexion** (failure analysis): Analyzes failures to understand root causes and prevent recurrence. Achieves +22% improvement on ALFWorld benchmark.

3. **SimpleMem** (quality-gated writes): Every write to knowledge/ passes through `protocols/quality-gate.md` to prevent memory poisoning. Achieves 26.4% improvement over systems with unfiltered writes (Mem0 baseline).

## Core vs. User Data Separation

Upgrades must preserve user work while updating core system files. This separation is critical for non-destructive updates.

**Core Files** (replaced during upgrade):
- `BOOT.md`, `VERSION.md` — System configuration
- `protocols/*.md` — Operating procedures
- `adapters/*.md` — Tool-specific integrations

**User Files** (never touched during upgrade):
- `config.md` — Project context
- `knowledge/domains/` — Learned patterns
- `knowledge/stack/` — Tech-specific knowledge
- `workspace/` — In-progress work
- `history/` — Append-only records

The `src/commands/upgrade.js` module implements this separation using the `CORE_FILES` list. Tests in `tests/upgrade.test.js` verify that core and user files are correctly identified.

## The Adapter Pattern

Different LLM tools (Claude Code, Codex, Gemini, Cursor) have different capabilities and integration requirements. Agent Mind uses adapters to maintain tool-agnostic core memory while providing tool-specific integration guidance.

Each adapter file (`adapters/[tool].md`) contains:
- How to read this memory system from that tool
- Tool-specific conventions (e.g., where to place .agent-mind/)
- Special integration points (e.g., how Claude Code finds memory)

New tools can be supported by:
1. Creating a new `adapters/[tool].md`
2. Adding it to the BOOT.md adapter section
3. Adding it to `CORE_FILES` in `src/commands/upgrade.js`

The core memory system remains unchanged — the adapter is just guidance.

## Quality Gates

Before any insight, pattern, or failure analysis is written to `knowledge/`, it passes through `protocols/quality-gate.md`. Three questions:

1. **Is it new?** Not already captured elsewhere
2. **Is it generalizable?** Applies beyond this specific task
3. **Was the outcome verified?** Tests passed, human confirmed, or logic holds

This gate prevents memory poisoning — a phenomenon documented in MINJA research where unfiltered information can mislead agents (>95% success rate at injection attacks on unfiltered systems).

## Self-Maintenance

The system is not autonomous. It proposes maintenance, the human decides.

Triggered by:
- Last maintenance entry in `history/maintenance-log.md` > 2 weeks old
- `history/episodes/_index.md` has 5+ entries

When triggered, follow `protocols/maintenance.md` to:
- Health check: stale insights? growing too large? contradictions?
- Flag uncertain memories
- Propose cleanup actions
- Report what's working and what's not

The agent never unilaterally deletes or modifies knowledge. All maintenance actions are human-approved.

## Related Research

- **CoALA** (Crispino et al.): Proposed four memory types (spatial, temporal, semantic, episodic) — agent-mind maps these to workspace, history, knowledge, and protocols
- **MemGPT/Letta**: Demonstrated filesystem beats vector DBs (74% vs 68.5%)
- **ExpeL**: Cross-task learning through experience extraction (+31% ALFWorld)
- **Reflexion**: Failure-driven learning and refinement (+22% ALFWorld)
- **SimpleMem**: Quality-gated writes prevent poisoning (26.4% improvement)
- **Xiong et al.**: Documented self-degradation in long-running agents — maintenance loops prevent this
- **MINJA**: Showed memory poisoning is highly effective (>95% success) — quality gates defend against it
- **Claude Code**: Internal studies found 92% rule adherence for <200 line files, dropping to ~70% above 200 lines

## Extensibility

New domains, stack knowledge, and custom protocols are added by creating markdown files. No migrations, no schema changes. The structure is self-describing:

- New domain: Create `knowledge/domains/[name]/` with `patterns.md` and `failures/_index.md`
- New tech knowledge: Create `knowledge/stack/[tech].md`
- Custom protocol: Create `protocols/[name].md` and reference it from BOOT.md or workflow.md

The system grows through markdown file creation, not code changes.
