# Workflow Protocol

How you approach every task. Not a rigid pipeline — a thinking process. Scale depth to task size. A 5-minute fix doesn't need a full spec. A multi-day feature does.

---

## Phase 1: Understand

Before anything else, understand what's really being asked.

- What is the actual goal? (Not just what was said — what is the human trying to achieve?)
- What is the scope? (What's included? What's explicitly not?)
- Is this a new task, or continuation of something in `workspace/`?

Write your understanding to `workspace/task.md`. Keep it to 5-15 lines. If you can't summarize it concisely, you don't understand it yet.

## Phase 2: Load Context

Check what you already know that's relevant.

1. **Domain knowledge**: Scan `knowledge/domains/` — does this task touch a known domain?
   - If yes: read that domain's `patterns.md` and `failures/_index.md`
2. **Stack knowledge**: Scan `knowledge/stack/` — does the task involve a known technology?
   - If yes: read the relevant stack file
3. **Cross-domain insights**: Check `knowledge/insights.md` for applicable learnings
4. **Past work**: Search `history/episodes/_index.md` — done something similar before?
   - If yes: read that episode for context

Don't load everything. Load what's relevant. Write what you loaded and why to `workspace/context.md`. This audit trail matters for maintenance.

## Phase 3: Think Critically

This is where the real value is. Before doing any work:

**Check failures:** For each matched domain, scan the failures index. Does this task have conditions that match a known failure pattern? If yes, explicitly address it in your approach.

**Identify unknowns:**
- **BLOCKING unknowns** — you cannot proceed without the answer
  - Write to `workspace/questions.md`
  - HALT. Surface these to the human. Do not continue until resolved.
- **Assumable unknowns** — reasonable defaults exist
  - Write to `workspace/assumptions.md` with the default you're choosing and why

**Check edges:** What's the simplest thing that could go wrong?
- What if the input is empty, null, huge, or malformed?
- What if this runs concurrently? What about race conditions?
- What does this interact with that could break?
- What's the failure mode? How does the human know something went wrong?

## Phase 4: Work

Now do the actual work. As you work:

- Write key decisions to `workspace/decisions.md` with your reasoning
- If you discover new unknowns mid-work, go back to Phase 3
- If something breaks that matches a known failure pattern, note it — your knowledge was correct
- If something breaks that's NOT in your failure library, note it — this is learning fuel for Phase 5

## Phase 5: Capture

After the task is done (or failed), follow `protocols/compaction.md` to:

1. Summarize what happened → episode log
2. Extract any insights worth remembering → quality gate
3. If failed: write a reflection (what went wrong, why, what to do differently)
4. Clear `workspace/`

---

## Scaling to Task Size

**Quick task (< 30 min):**
Phase 1 (2-3 lines). Phase 2 (quick scan). Phase 3 (mental check only). Phase 4. Phase 5 (1-line episode entry).

**Medium task (1-4 hours):**
Full Phases 1-5. Write task.md before coding. Check failures properly.

**Large task (multi-day):**
Full Phases 1-5 with deep Phase 3. Break into sub-tasks. Multiple episode entries. Maintain workspace/ across sessions.

The protocol adapts to the work. The principle doesn't change: understand before you build, load what you know, think critically, capture what you learn.
