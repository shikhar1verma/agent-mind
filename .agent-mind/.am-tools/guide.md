# Agent Mind Tools — Guide

These scripts are **optional utilities** for handling mechanical memory operations. You can do everything manually by editing files directly, or use these scripts to speed up common operations.

**When to use them:** After following `protocols/compaction.md` and `protocols/maintenance.md`, when you need quick file operations.

**Important:** These tools are helpers, not replacements for the thinking protocols. Always follow the protocol logic first, then use tools to execute the mechanical parts.

---

## Tool: `am-compact`

**Purpose:** Create an episode summary file after a completed task.

**When:** After Phase 5 of `protocols/workflow.md`, to create the episode file structure.

**Usage:**
```bash
./am-compact [task-slug] [domain] [outcome] [summary]
```

**Parameters:**
- `task-slug` — kebab-case identifier for the task (e.g., `auth-token-validation`)
- `domain` — domain name(s) touched, comma-separated (e.g., `auth,security`)
- `outcome` — one of: `completed`, `failed`, `abandoned`
- `summary` — one-line summary (quoted if spaces)

**Example:**
```bash
./am-compact "auth-token-validation" "auth,security" completed "Implemented JWT expiry validation with clock skew buffer"
```

**What it does:**
1. Creates `history/episodes/YYYY-MM/[task-slug].md` with template structure
2. Appends a line to `history/episodes/_index.md`
3. Opens the episode file for you to fill in details (key insight, assumptions made, etc.)

**Manual alternative:** Create the file directly in `history/episodes/YYYY-MM/[task-slug].md` following the format in `protocols/compaction.md`.

---

## Tool: `am-reflect`

**Purpose:** Create a reflection file for a failed task.

**When:** After a task fails and you're following Path B of `protocols/compaction.md`.

**Usage:**
```bash
./am-reflect [task-slug] [domain] [what-went-wrong]
```

**Parameters:**
- `task-slug` — same identifier used in the episode
- `domain` — domain where failure occurred
- `what-went-wrong` — one-line summary of the failure

**Example:**
```bash
./am-reflect "auth-token-validation" "auth" "Clock skew buffer off by 1ms, caused false rejections in high-latency environments"
```

**What it does:**
1. Creates `history/reflections/YYYY-MM-DD-[slug].md` with reflection structure
2. Appends entry to `history/reflections/_index.md`
3. Opens the file for you to fill in root cause analysis and detection conditions

**Manual alternative:** Create the file directly following the format in `protocols/compaction.md`.

---

## Tool: `am-insight`

**Purpose:** Manage cross-domain insights in `knowledge/insights.md`.

**When:** During Phase 3 of compaction when you've identified a generalizable learning.

**Usage:**
```bash
./am-insight add [title] [insight] [domains]
./am-insight upvote [insight-number]
./am-insight downvote [insight-number]
./am-insight remove [insight-number]
```

**Examples:**
```bash
./am-insight add "JWT Validation" "Always validate JWT expiry with a clock skew buffer of 30-60 seconds" "auth,security"
./am-insight upvote 3
./am-insight downvote 5
```

**What it does:**
- `add`: Creates a new insight entry with `votes: 1`
- `upvote`: Increments the vote count for an insight (confirms it)
- `downvote`: Decrements the vote count (contradicts it)
- `remove`: Deletes an insight with votes < -2

**Format it uses:**
```markdown
### [Title]
- **Insight:** [the learning]
- **Domains:** [domains]
- **Votes:** [number]
- **Added:** YYYY-MM-DD | **Last touched:** YYYY-MM-DD
- **Evidence:** [tasks confirming/contradicting]
```

**Manual alternative:** Edit `knowledge/insights.md` directly.

---

## Tool: `am-pattern`

**Purpose:** Add a pattern to a domain's patterns.md file.

**When:** During Phase 3 of compaction, when you've identified a reusable approach.

**Usage:**
```bash
./am-pattern [domain] [pattern-name] [when] [what] [why]
```

**Parameters:**
- `domain` — target domain (will create if doesn't exist)
- `pattern-name` — short name for the pattern
- `when` — conditions when this pattern applies
- `what` — the approach/technique
- `why` — reasoning

**Example:**
```bash
./am-pattern "auth" "jwt-clock-skew" \
  "Validating JWT expiry in distributed systems" \
  "Add 30-60s clock skew buffer to expiry check" \
  "Handles clock drift between services without rejecting valid tokens"
```

**What it does:**
1. Opens or creates `knowledge/domains/[domain]/patterns.md`
2. Appends the pattern with today's date and originating task slug
3. Keeps the file under 200 lines (suggests archiving old patterns if needed)

**Manual alternative:** Edit `knowledge/domains/[domain]/patterns.md` directly.

---

## Tool: `am-failure`

**Purpose:** Log a failure pattern to a domain's failure library.

**When:** During Path B of compaction, after analyzing what went wrong.

**Usage:**
```bash
./am-failure [domain] [slug] [trigger-condition] [summary]
```

**Parameters:**
- `domain` — affected domain
- `slug` — short slug for this failure
- `trigger-condition` — what conditions trigger this failure
- `summary` — one-line summary of the failure

**Example:**
```bash
./am-failure "auth" "jwt-clock-skew-too-small" \
  "JWT expiry validation with clock skew < 30 seconds in high-latency networks" \
  "False token rejections due to insufficient clock skew buffer"
```

**What it does:**
1. Appends entry to `knowledge/domains/[domain]/failures/_index.md`
2. Creates `knowledge/domains/[domain]/failures/[slug].md` with detail template
3. Opens the detail file for you to add conditions and prevention steps

**Index format:**
```
YYYY-MM-DD | slug | trigger condition | one-line summary
```

**Manual alternative:** Edit the failure index and create detail files manually.

---

## Tool: `am-health`

**Purpose:** Quick memory health check (size audit only).

**When:** Quick sanity check between full maintenance runs, or before a big task.

**Usage:**
```bash
./am-health
```

**What it does:**
1. Scans all core memory files against size limits (from `protocols/memory-ops.md`)
2. Reports any files over limits with line counts
3. Lists files last modified more than 30 days ago
4. Shows episode/reflection/insight counts

**Output example:**
```
Memory Health Check — 2026-03-22

Size Audit:
  BOOT.md: 120 / 150 lines — OK
  protocols/workflow.md: 82 / 200 lines — OK
  knowledge/insights.md: 5 entries / 100 max — OK

Stale Files (30+ days):
  None

Summary:
  Episodes: 12 total
  Reflections: 2 total
  Insights: 5 total
```

**Manual alternative:** Run `wc -l` on files and check timestamps manually.

---

## Tool: `am-maintain`

**Purpose:** Run the full maintenance protocol and generate a report.

**When:** After the human requests a health check, or every 2 weeks.

**Usage:**
```bash
./am-maintain
```

**What it does:**
1. Runs all steps from `protocols/maintenance.md`:
   - Size check (all files vs limits)
   - Stale memory check (zero-vote insights, unverified entries, unused patterns)
   - Contradiction check (failed tasks vs loaded patterns, negative votes, conflicts)
   - Growth review (episodes, knowledge, insights movement)
2. Generates report (see template in maintenance.md)
3. Saves report to `history/maintenance-reports/YYYY-MM-DD.md`
4. Outputs recommendations (but does NOT execute changes)

**Your job:** Review the report, decide which recommendations to act on, tell the agent which ones to execute.

**Manual alternative:** Follow `protocols/maintenance.md` manually and create the report yourself.

---

## Important Notes

1. **These tools are optional.** Every operation can be done manually by editing files. Use them if they speed you up.

2. **Tools follow protocols.** They automate the mechanics of the protocols, not the thinking. You still need to understand what you're capturing and why.

3. **They create well-formed files.** All tools create markdown with consistent formatting, making it easier for agents to parse and maintain.

4. **No destructive operations.** Tools never delete files from `history/` or `knowledge/` — they append only. Maintenance (which proposes deletions) is manual review + human decision.

5. **Look at the generated files.** After running a tool, open the created file and verify it's what you expected. These are learning records — get them right.

---

## Troubleshooting

**Tool not found:** Make sure `.agent-mind/.am-tools/` is in your PATH, or call with `./am-tools/[tool-name]`.

**File already exists:** Tools append to existing files rather than overwriting. This prevents data loss.

**Large files:** If a tool warns that a file is over limit, follow the maintenance protocol to archive old entries.

**Custom tools:** You can create your own tools in `.agent-mind/.am-tools/`. Keep them as bash scripts following the same conventions.
