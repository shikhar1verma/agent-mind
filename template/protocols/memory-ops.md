# Memory Operations Protocol

How to read from and write to each memory tier. The goal: load the right context at the right time, write only what deserves to persist.

---

## Reading Memory

### Hot Tier — Always Loaded
These load at session start. No decision needed.
- `BOOT.md` — operating instructions
- `config.md` — project context
- `protocols/*` — operating procedures (loaded as needed during work)

### Warm Tier — Loaded by Relevance
Load these based on what the current task needs.
- `knowledge/domains/[domain]/patterns.md` — when task touches that domain
- `knowledge/domains/[domain]/failures/_index.md` — scan before implementation
- `knowledge/stack/[tech].md` — when task involves that technology
- `knowledge/insights.md` — scan for applicable cross-domain learnings

**How to decide what to load:**
1. Identify the task's domain(s) from the description
2. Load matching domain patterns + failure indexes
3. Load relevant stack knowledge
4. Scan insights.md for entries tagged with matching domains
5. Write what you loaded and why to `workspace/context.md`

**Don't overload context.** If you match 5+ domains, prioritize the 2-3 most relevant. Loading too much degrades performance. Research shows context rot is real — more isn't better.

### Cold Tier — Searched on Demand
Only access when you specifically need historical context.
- `history/episodes/_index.md` — search for related past work
- `history/episodes/YYYY-MM/[slug].md` — read specific episode details
- `history/reflections/_index.md` — search for relevant failure analysis
- `knowledge/domains/[domain]/failures/[slug].md` — detailed failure context

---

## Writing Memory

### workspace/ (Working Memory)
- **When:** During any active task
- **Rules:** Write freely. This is scratch space. Cleared after compaction.
- **Files:** task.md, context.md, questions.md, assumptions.md, decisions.md, progress.md
- **No gate required.** This is ephemeral.

### history/episodes/ (Episodic Memory)
- **When:** During compaction (protocols/compaction.md) only
- **Rules:** Append-only. Never edit or delete existing episodes.
- **Format:** Add entry to `_index.md`, create episode file in `YYYY-MM/`
- **No gate required.** Every completed task gets an episode. But keep summaries concise (5-10 lines).

### history/reflections/ (Failure Analysis)
- **When:** During compaction, only when a task failed
- **Rules:** Append-only. Follow the reflection format in compaction.md.
- **Format:** Add entry to `_index.md`, create reflection file

### knowledge/ (Semantic Memory)
- **When:** During compaction, and ONLY after passing quality gate
- **Rules:** MUST pass `protocols/quality-gate.md` before writing
- **Prefer updates over creation.** If a pattern already exists, update it rather than creating a new entry.
- **Include provenance.** Every entry should note the date and originating task.
- **Tag uncertainty.** If outcome wasn't verified, tag `[UNVERIFIED]`.

### knowledge/insights.md (Cross-Domain Learnings)
- **Operations:**
  - `ADD` — new generalizable learning, set `votes: 1`
  - `UPVOTE` — task confirms existing insight, `votes + 1`
  - `DOWNVOTE` — task contradicts existing insight, `votes - 1`
  - `PROMOTE` — insight with `votes > 5` moves to relevant domain's patterns.md
  - `REMOVE` — insight with `votes < -2` after appearing in 10+ tasks

---

## File Size Limits

Keep these in check. Oversized files degrade agent performance.

| File | Max Size | Action if exceeded |
|------|----------|-------------------|
| BOOT.md | 150 lines | Trim or split into referenced files |
| Each protocol file | 200 lines | Split into sub-protocols |
| Each domain patterns.md | 200 lines | Archive older patterns, keep most relevant |
| Each failure _index.md | 100 lines | Archive old entries to _archive.md |
| insights.md | 100 entries | Prune low-vote entries, promote high-vote ones |
| Episode _index.md | Unlimited | But archive entries older than 90 days |

These limits come from research: files under 200 lines achieve >92% instruction adherence. Beyond that, agents start skipping content.
