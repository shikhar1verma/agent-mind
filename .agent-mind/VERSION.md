# Agent Mind — Version & Manifest

## Installation Info
- **Installed version:** 1.0.1
- **Installed date:** 2026-03-22
- **npm package:** agent-mind

---

## Core Files (Managed by Upgrade)

These files are replaced when you upgrade the agent-mind package. They should not be edited locally — any customizations will be lost.

- `BOOT.md` — Agent entry point and session start protocol
- `protocols/workflow.md` — 5-phase thinking process
- `protocols/memory-ops.md` — Memory read/write rules and file limits
- `protocols/compaction.md` — Post-task consolidation protocol
- `protocols/quality-gate.md` — Memory quality filter
- `protocols/maintenance.md` — Self-maintenance protocol
- `.agent-mind/.am-tools/guide.md` — Tool documentation
- `adapters/claude.md` — Claude Code integration
- `adapters/codex.md` — OpenAI Codex integration
- `adapters/gemini.md` — Gemini CLI integration
- `adapters/cursor.md` — Cursor integration
- `VERSION.md` — This file

---

## User Files (Never Touched on Upgrade)

These files are yours. The upgrade process will never modify them, even if major updates happen. You control these entirely.

- `config.md` — Project configuration and context
- `README.md` — Project-specific agent mind setup notes (if you create one)
- `knowledge/domains/*/patterns.md` — Domain-specific patterns you've learned
- `knowledge/domains/*/failures/` — Failure libraries you've built
- `knowledge/stack/` — Stack-specific knowledge
- `knowledge/insights.md` — Cross-domain learnings
- `workspace/` — Working memory (ephemeral, cleared after compaction)
- `history/episodes/` — Episodic memory (task records)
- `history/episodes/_index.md` — Episode index
- `history/reflections/` — Failure reflections
- `history/reflections/_index.md` — Reflections index
- `history/maintenance-log.md` — Maintenance audit trail

---

## Upgrade Behavior

When you run `npx agent-mind upgrade` or receive a new version:

1. Core files are replaced with the new version
2. User files are never touched
3. A backup of your previous core files is created in `.agent-mind/_backups/[version]/` (optional, kept for reference)
4. If you have customized any core files, consider moving those customizations to `config.md` or creating a custom protocol file

If you need to extend the system, create new files in `protocols/` (custom protocols) rather than editing existing ones.
