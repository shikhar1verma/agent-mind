# Quality Gate Protocol

Not everything deserves to be remembered. Bad memories poison the system. Research confirms: agents using naive "remember everything" strategies show sustained performance decline after an initial improvement. This gate prevents that.

Inspired by: SimpleMem (quality-gated writes, 26.4% improvement over Mem0), Xiong et al. (self-degradation in long-running agents).

---

## The Three Questions

Before writing anything to `knowledge/`, answer these:

### 1. Is it new?
- Does this information already exist in `knowledge/`?
- If it's a **duplicate** → don't write. The existing entry is enough.
- If it's a **correction** → edit the existing entry. Note the date and why it changed.
- If it's an **extension** → update the existing entry with the new information.

### 2. Is it generalizable?
- Will this apply to future tasks beyond this specific one?
- **Generalizable:** "Always validate JWT expiry with a clock skew buffer" — applies to any JWT implementation
- **Not generalizable:** "The user table has a column called `display_name`" — specific to this project
- Project-specific facts belong in `config.md` or episode summaries, not in `knowledge/`

### 3. Was the outcome verified?
- Did the approach actually work? Evidence:
  - Tests passed
  - Human confirmed the result
  - The logic holds under scrutiny
  - The approach was used successfully in production
- **Unverified outcomes** (agent finished, but no confirmation) should be tagged `[UNVERIFIED]`

## The Decision

| Question 1 (New?) | Question 2 (General?) | Question 3 (Verified?) | Action |
|---|---|---|---|
| Yes | Yes | Yes | Write to knowledge/ |
| Yes | Yes | Uncertain | Write with `[UNVERIFIED]` tag |
| Yes | No | Any | Don't write. Episode summary is enough. |
| No (duplicate) | Any | Any | Don't write. |
| No (correction) | Yes | Yes | Edit existing entry. |
| No (extension) | Yes | Yes | Update existing entry. |

## Memory Poisoning Prevention

The biggest risk to this system is a wrong entry in `knowledge/`. A bad pattern will be loaded and applied to every future task in that domain. Defenses:

1. **Provenance:** Every entry in `knowledge/` includes the date and originating task. So you can trace where a questionable pattern came from.

2. **Uncertainty tagging:** If you're not sure, tag `[UNVERIFIED]`. The maintenance protocol reviews these.

3. **Contradiction detection:** If a task fails and the failure matches a pattern you loaded from `knowledge/`, that pattern might be wrong. Flag it immediately — don't wait for maintenance.

4. **Vote decay:** Insights in `insights.md` with negative votes after multiple tasks are likely wrong. Remove at `votes < -2` after 10+ task appearances.

5. **Human review:** During maintenance (`protocols/maintenance.md`), surface all `[UNVERIFIED]` entries and suspicious patterns for human decision.

## Insight Voting Rules

`knowledge/insights.md` uses a vote system to surface what's true and prune what's not:

- **ADD:** New generalizable learning. Set `votes: 1`. Tag with relevant domain(s).
- **UPVOTE:** A subsequent task confirms this insight. `votes + 1`.
- **DOWNVOTE:** A subsequent task contradicts this insight. `votes - 1`.
- **PROMOTE:** `votes > 5` → move to the relevant domain's `patterns.md`. It's proven.
- **REMOVE:** `votes < -2` after the insight has existed for 10+ tasks. It's wrong or useless.
