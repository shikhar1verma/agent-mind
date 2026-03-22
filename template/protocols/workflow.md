# Workflow Protocol

How you approach every task. Not a rigid pipeline — a thinking process that scales to what the task actually requires.

---

## Phase 1: Understand

Before anything else, understand what's really being asked.

- What is the actual goal? (Not just what was said — what is the human trying to achieve?)
- What is the scope? (What's included? What's explicitly not?)
- Is this a new task, or continuation of something in `workspace/`?

**Quick tasks:** Hold your understanding in your head. A few sentences of internal clarity is enough.
**Medium/large tasks:** Write your understanding to `workspace/task.md`. Keep it to 5-15 lines. If you can't summarize it concisely, you don't understand it yet.

## Phase 2: Load Context

Check what you already know that's relevant.

1. **Domain knowledge**: Scan `knowledge/domains/` — does this task touch a known domain?
   - If yes: read that domain's `patterns.md` and `failures/_index.md`
2. **Stack knowledge**: Scan `knowledge/stack/` — does the task involve a known technology?
   - If yes: read the relevant stack file
3. **Cross-domain insights**: Check `knowledge/insights.md` for applicable learnings
4. **Past work**: Search `history/episodes/_index.md` — done something similar before?
   - If yes: read that episode for context

Don't load everything. Load what's relevant.

**Quick tasks:** List the directories. Read matching files. Note what you found (or that the domain is new). This is a file read, not a mental exercise.
**Medium/large tasks:** Write what you loaded and why to `workspace/context.md`. This audit trail matters for maintenance.

## Phase 3: Think Critically

This is where the real value is. Before doing any work:

**Check failures:** For each matched domain, scan the failures index. Does this task have conditions that match a known failure pattern? If yes, explicitly address it in your approach.

**Identify unknowns:**
- **BLOCKING unknowns** — you cannot proceed without the answer
  - HALT. Surface these to the human. Do not continue until resolved.
  - Medium/large tasks: write to `workspace/questions.md`
- **Assumable unknowns** — reasonable defaults exist
  - Note your assumption and why it's reasonable.
  - Medium/large tasks: write to `workspace/assumptions.md`

**Check edges:** What's the simplest thing that could go wrong?
- What if the input is empty, null, huge, or malformed?
- What if this runs concurrently? What about race conditions?
- What does this interact with that could break?
- What's the failure mode? How does the human know something went wrong?

**Quick tasks:** Mental check. If no blocking unknowns and no matched failures, proceed.
**Medium/large tasks:** Full analysis. Write questions, assumptions, and edge cases to workspace.

## Phase 4: Work

Now do the actual work. As you work:

- If you discover new unknowns mid-work, go back to Phase 3
- If something breaks that matches a known failure pattern, note it — your knowledge was correct
- If something breaks that's NOT in your failure library, note it — this is learning fuel for Phase 5

**Quick tasks:** Just work. Key decisions live in your conversation context.
**Medium/large tasks:** Write key decisions to `workspace/decisions.md` with your reasoning.

## Phase 5: Capture

After the task is done (or failed), follow `protocols/compaction.md` to:

1. Summarize what happened — episode record
2. If you wrote to `knowledge/` — apply quality gate (always, regardless of task size)
3. If failed: write a reflection (what went wrong, why, what to do differently)
4. Clear `workspace/` if you used it

**Quick tasks:** One-line entry in `history/episodes/_index.md`. Quality gate if you touched `knowledge/`. Done.
**Medium/large tasks:** Full episode detail file in `history/episodes/YYYY-MM/[slug].md`. Full compaction with insights extraction.

---

The protocol adapts to the work. The principle doesn't change: understand before you build, load what you know, think critically, capture what you learn.
