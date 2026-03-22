# Agent Mind

Cognitive memory system for LLM agents. An npm package that scaffolds a `.agent-mind/` folder giving any AI coding tool structured memory.

## Agent Mind Memory System
This project uses Agent Mind for structured memory management.
At the start of every session, read `.agent-mind/BOOT.md` and follow its protocols.
Use `.agent-mind/workspace/` as working memory for the current task.
After completing a task, follow `.agent-mind/protocols/compaction.md`.
When asked about memory health, follow `.agent-mind/protocols/maintenance.md`.

## Project Structure

- `bin/cli.js` — CLI entry point. Commands: init, upgrade, doctor, version, help.
- `src/commands/` — Command implementations. `init.js` is the main one (interactive setup).
- `src/utils/` — Shared utilities: template copying, tool detection, adapter injection, versioning.
- `template/` — The `.agent-mind/` folder template that gets copied on `npx agent-mind init`. This IS the product.
- `tests/` — Node.js built-in test runner. Structure tests, size tests, reference integrity, upgrade tests, benchmarks.
- `docs/` — Architecture, research foundations, benchmarks, contributing guide.

## Key Constraints

- Pure markdown, no databases, no YAML, no scripts in the template itself (`.am-tools/` has optional shell scripts but they're helpers, not core).
- Every file in `template/` must be <200 lines. This is tested (`tests/sizes.test.js`). Rule adherence drops above 200 lines.
- Three-tier memory: hot (always loaded), warm (loaded by relevance), cold (searched on demand).
- Quality-gated writes prevent memory poisoning. Agents propose, humans decide.

## Running Tests

```bash
npm test                    # Structure, size, reference, template, tools, upgrade tests
npm run test:benchmarks     # Protocol adherence benchmark (simulated agent behavior)
```

All tests use Node.js built-in test runner (`node --test`). No test framework dependencies.

## npm Publishing

`package.json` has a `files` whitelist: only `bin/`, `src/`, `template/`, `README.md`, `LICENSE` ship to npm. Everything else (docs, tests, .agent-mind, CLAUDE.md) stays out of the tarball.

## When Editing Protocols

The three protocol files (`template/protocols/workflow.md`, `compaction.md`, `quality-gate.md`) have scaling guidance integrated inline at each phase — quick/medium/large tasks get different ceremony levels. If you edit these, keep scaling inline. Do NOT put scaling in a separate section at the bottom; agents miss it there (this was the root cause of a 0% benchmark score).

## Architecture Decisions

- Filesystem > vector DB (Letta research: 74% vs 68.5% task success)
- Adapters per tool (`template/adapters/`) — Claude, Codex, Cursor, Gemini
- Append-only history, compaction via protocol not automation
- No dependencies in package.json — zero runtime deps
