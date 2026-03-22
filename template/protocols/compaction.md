# Compaction Protocol

Run this after every completed task. Goal: capture what matters, discard noise, keep memory healthy. This is the learning loop — the mechanism that makes the system smarter over time.

Backed by: ExpeL (cross-task learning, +31% on ALFWorld), Reflexion (failure analysis, +22% on AlfWorld), SimpleMem (quality-gated writes, 26.4% improvement over Mem0).

---

## What Always Happens (Any Task Size)

Regardless of whether the task took 5 minutes or 5 days:

1. **Episode index entry** — Add a one-line entry to `history/episodes/_index.md`:
   ```
   YYYY-MM-DD | domain(s) | outcome | task-slug | One-line summary
   ```

2. **Quality gate on knowledge writes** — If you wrote ANYTHING to `knowledge/` during this task, verify each write passed through `protocols/quality-gate.md`. This is not optional. Bad memories are worse than no memories.

3. **Clear workspace** — If you wrote to `workspace/` during the task, delete all workspace files. The valuable information is now in `history/` or `knowledge/`.

For quick tasks (under 30 minutes), you can stop here. The index entry is your record.

---

## Full Compaction (Medium and Large Tasks)

### Step 1: Create Episode Detail File

Create a new file: `history/episodes/YYYY-MM/[task-slug].md`

Use this format:
```
# [Task Slug]
**Date:** YYYY-MM-DD
**Domain(s):** [domains touched]
**Outcome:** completed | failed | abandoned
**Summary:** [2-3 sentences: what was done, what was the result]
**Key insight:** [1 sentence: the most important thing learned, or "none"]
**Assumptions made:** [brief list, or "none"]
```

### Step 2: Quality Gate

Before writing ANYTHING to `knowledge/`, pass through `protocols/quality-gate.md`.

Ask three questions:
1. **Is it new?** Not already captured in knowledge/.
2. **Is it generalizable?** Applies beyond this specific task.
3. **Was the outcome verified?** Tests passed, human confirmed, or logic holds.

If yes to all three → proceed to Step 3.
If uncertain → tag `[UNVERIFIED]` and proceed.
If no → stop here. The episode summary is enough.

### Step 3: Extract Learnings

#### Path A: Task Completed Successfully

**Check insights:** Does this task confirm an existing insight in `knowledge/insights.md`?
- Yes → UPVOTE that insight (increment vote count)
- No → Is there a new generalizable learning? → ADD with `votes: 1`

**Check patterns:** Did you use an approach worth remembering?
- If new reusable pattern → append to `knowledge/domains/[domain]/patterns.md`
- Include: what the pattern is, when to use it, date, originating task

**Check for promotion:** Any insight in insights.md with votes > 5?
- Yes → move it to the relevant domain's patterns.md (it's proven enough)

#### Path B: Task Failed

**Write reflection** to `history/reflections/YYYY-MM-DD-[slug].md`:
```
# Reflection: [Task Slug]
**Date:** YYYY-MM-DD
**What was attempted:** [brief description]
**What went wrong:** [what actually happened]
**Root cause:** [why it happened — not symptoms, the actual cause]
**What to do differently:** [concrete change for next time]
**Detection condition:** [how to spot this failure pattern in future tasks]
```

Add entry to `history/reflections/_index.md`:
```
YYYY-MM-DD | domain | slug | One-line: what went wrong
```

**Update failure library:** Check `knowledge/domains/[domain]/failures/`:
- New failure pattern → create entry file, add to `_index.md`
- Known failure that wasn't caught → update its detection conditions

**Check insights:**
- Should have prevented this? → UPVOTE the relevant insight
- New insight from this failure? → ADD with `votes: 1`

#### Path C: Task Abandoned

Just log the episode (always-do step 1) with outcome "abandoned" and a note on why. No knowledge extraction. Abandoned tasks don't teach reliably — the outcome is unknown.
