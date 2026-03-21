# Maintenance Protocol

Memory degrades over time without maintenance. Stale insights mislead. Oversized files get partially ignored. Wrong patterns compound errors. This protocol catches those problems.

Run this when:
- The human asks for a memory health check
- You notice memory is getting large or stale during normal work
- It's been 2+ weeks since last maintenance (check `history/maintenance-log.md`)
- After a cluster of failed tasks (something might be wrong with knowledge/)

---

## Step 1: Size Check

Check every file against its size limit (from `protocols/memory-ops.md`):

| File | Max | Action if exceeded |
|------|-----|-------------------|
| BOOT.md | 150 lines | Must trim. This file's adherence matters most. |
| Each protocol file | 200 lines | Split or trim. |
| Each domain patterns.md | 200 lines | Archive older/less-used patterns to `_archive.md` |
| Each failure _index.md | 100 lines | Archive old entries |
| insights.md | 100 entries | Prune lowest-vote entries |
| episode _index.md | Unlimited | Archive entries older than 90 days to `_archive.md` |

Flag any oversize files with exact line counts.

## Step 2: Stale Memory Check

- **Zero-vote insights** untouched for 30+ days → flag for review. Are they worth keeping?
- **[UNVERIFIED] entries** older than 14 days → ask human to verify or remove
- **Domain patterns** not referenced by any task in 60+ days → flag as potentially stale
- **Stack knowledge** for tech no longer in `config.md` → flag for archival

## Step 3: Contradiction Check

This is the most important step. Bad memories compound.

- Did any recent task **fail** in a domain where `patterns.md` was loaded?
  → The loaded pattern might have been wrong. Cross-reference the failure with the pattern.
- Are there insights with **negative votes**?
  → List them with vote counts. Recommend removal for votes < -2.
- Are there **contradictory entries** — two patterns that give conflicting advice?
  → Flag both with the contradiction. Human decides which to keep.
- Did the agent **ignore a failure pattern** that turned out to be relevant?
  → The failure's detection conditions need updating.

## Step 4: Growth Review

- How many episodes were created since last maintenance?
- How many new knowledge entries were written?
- How many insights were added vs promoted vs removed?
- Is the system learning? (Are insights getting upvoted? Are failures being caught?)
- Is the system degrading? (Increasing failure rate? Patterns not helping?)

## Step 5: Produce Report

Create a report for the human. Don't act on it — present it.

```markdown
## Memory Health Report — YYYY-MM-DD

### Overall Status: [Healthy | Needs Attention | Issues Found]

### Size Audit
- [File]: [current] / [max] lines — [OK | OVER — recommend: trim/split/archive]

### Stale Entries (need human decision)
- [Entry description] — last relevant: [date] — recommend: [keep/remove/verify]

### Suspicious Patterns (possible memory poisoning)
- [Pattern] in [domain] — evidence: [what went wrong] — recommend: [review/remove/update]

### Contradictions Found
- [Pattern A] vs [Pattern B] — recommend: [human decides]

### Growth Summary
- Episodes: [N] new since last maintenance
- Knowledge writes: [N] (passed gate: [N], tagged unverified: [N])
- Insights: [N] added, [N] upvoted, [N] downvoted, [N] promoted, [N] removed

### Recommendations
1. [Specific actionable recommendation]
2. [...]
```

## Step 6: Execute Approved Changes

After the human reviews the report:
- Execute only the changes they approve
- Log what was done to `history/maintenance-log.md`:
  ```
  YYYY-MM-DD | Actions: [what was done] | Triggered by: [human request / scheduled]
  ```

## Critical Rule

You NEVER autonomously delete or modify `knowledge/` during maintenance.
You analyze. You report. You recommend. You wait. The human decides.
