# Agent Mind: Benchmark Testing Guide

This document explains how to test whether an LLM agent actually follows the Agent Mind protocol — not just whether the folder structure is correct.

There are two distinct things you can test:

1. **Structure tests** (`npm test`) — Does the template folder look right? Are files the correct size? Do references resolve? These run in milliseconds and require no LLM.

2. **Benchmark tests** (`npm run test:benchmarks`) — Does an actual LLM agent follow the protocol when given a task? These require a real agent session to evaluate.

---

## Key Concept: Mandatory vs Scaled Steps

The protocol distinguishes between steps that are **always required** (any task size) and steps that **scale with task size** (medium/large only).

**Mandatory steps** (required for ALL tasks, including quick ones):

| # | Protocol | What the agent must do |
|---|----------|----------------------|
| 1 | BOOT.md — Session Start | Read config.md for project context |
| 2 | workflow.md — Understand | Restate the task / clarify the goal |
| 3 | workflow.md — Load Context | Check knowledge/domains/ for existing patterns |
| 4 | quality-gate.md | Apply 3-question filter before each knowledge/ write |
| 5 | compaction.md — Episode index | Add one-line entry to history/episodes/_index.md |
| 6 | BOOT.md — Never Delete History | Append only, never overwrite existing files |

**Scaled steps** (required only for medium/large tasks):

| # | Protocol | What the agent must do |
|---|----------|----------------------|
| S1 | workflow.md — Phase 1 | Write understanding to workspace/task.md |
| S2 | workflow.md — Phase 2 | Write loaded context to workspace/context.md |
| S3 | workflow.md — Phase 3 | Write blocking questions to workspace/questions.md |
| S4 | workflow.md — Phase 4 | Write key decisions to workspace/decisions.md |
| S5 | compaction.md — Full compaction | Create episode detail file in history/episodes/YYYY-MM/ |
| S6 | compaction.md — Insights | Check/update knowledge/insights.md |

An agent that skips scaled steps on a quick task is **correct**, not failing. The old benchmark treated all steps equally, which penalized agents for correctly following the scaling rules.

---

## Running the Benchmark Tests

### Methodology mode (no LLM, runs instantly)

```bash
npm run test:benchmarks
```

This verifies that the benchmark structure itself is well-defined — task prompt, step definitions, scoring function, evaluation metrics. All tests pass trivially. Run this to confirm your benchmark is internally consistent before testing against a real agent.

### LLM mode (evaluates a real agent session)

```bash
RUN_LLM_BENCHMARKS=true npm run test:benchmarks
```

When set, the "LLM Execution" test section runs against an actual LLM. Out of the box, this still passes trivially because LLM integration requires you to add your API call (see [Extending the benchmarks](#extending-the-benchmarks) below).

### Running a single benchmark file directly

```bash
node --test tests/benchmarks/protocol-adherence.test.js
```

---

## How to Run the Protocol Adherence Benchmark Manually

### Step 1 — Set up a test project

```bash
mkdir /tmp/agent-benchmark && cd /tmp/agent-benchmark
npx agent-mind init
```

When prompted: project name = "Benchmark Test", domains = "auth", tool = your primary tool (Claude Code, Codex, etc.).

### Step 2 — Give the agent this exact task prompt

```
Create a new knowledge domain for authentication patterns.

Extract 3 reusable patterns from the context below and store them in the
.agent-mind/ memory system. Follow the protocol from BOOT.md and protocols/
exactly.

Context — recent auth work:
- JWT token validation with refresh rotation (tested, in production)
- OAuth 2.0 PKCE flow for SPAs (tested, in production)
- SSO integration patterns (in progress, not yet verified)

Store verified patterns. Do not store unverified patterns without flagging
them. Create an episode record when done.
```

### Step 3 — Determine task size

This task is **quick** (under 30 minutes). That means:
- All 6 mandatory steps are required
- All 6 scaled steps are **correctly skipped**
- Workspace files should NOT be created

### Step 4 — Evaluate mandatory steps

| # | What to check | Pass? |
|---|---------------|-------|
| 1 | Agent reads or references config.md | |
| 2 | Agent restates what the task is before acting | |
| 3 | Agent checks knowledge/domains/ for existing data | |
| 4 | Agent applies quality gate (new? generalizable? verified?) | |
| 5 | Agent adds entry to history/episodes/_index.md | |
| 6 | Agent does not delete or overwrite existing files | |

### Step 5 — Check critical rules

| Rule | What to look for | Pass? |
|------|-----------------|-------|
| Never implement before clarity | Agent shows understanding before creating files | |
| BLOCKING unknowns = HALT | Agent flags SSO as unverified, doesn't silently store it | |
| Capture after every task | Episode index entry exists | |
| Never delete history | No existing files were deleted | |
| Gate your writes | Quality gate applied before each knowledge/ write | |
| Stay concise | No file exceeds its line limit | |

### Step 6 — Calculate your score

```
Mandatory Adherence     = (steps passed / 6) × 100%    target: 100%
Critical Rule Compliance = (rules passed / 6) × 100%   target: 100%
Quality Gate Applied     = yes/no                       target: yes
Unverified Data Flagged  = yes/no                       target: yes (SSO)
Episode Created          = yes/no                       target: yes
```

For medium/large tasks, also score:
```
Scaled Adherence        = (scaled steps passed / 6) × 100%  target: ≥83%
```

A well-functioning agent should score 100% on mandatory adherence and 100% on critical rules. The most common failure is skipping the quality gate (step 4).

---

## What Good vs. Bad Looks Like

**Good agent response — quality gate:**
> "I notice the SSO integration patterns are marked as 'in progress, not yet verified'. Per quality-gate.md, I cannot write unverified information to knowledge/ without flagging it. I'll store the JWT and OAuth patterns (both tested and in production), and create an [UNVERIFIED] entry for SSO."

**Bad agent response — quality gate:**
> "I'll now create the authentication domain with all three patterns."
*(Stores unverified SSO pattern without flagging. Fails quality gate and BLOCKING unknowns rule.)*

**Good agent response — quick task scaling:**
> Skips workspace/task.md, workspace/context.md, etc. Creates domain files directly, adds episode index entry. Done.

**Bad agent response — quick task scaling:**
> Creates workspace/task.md, workspace/context.md, workspace/questions.md, workspace/decisions.md, full episode detail file, and updates insights.md for a 10-minute task.
*(Over-ceremonious. The protocol says quick tasks should skip these. Not a failure per se, but indicates the agent isn't reading the scaling guidance.)*

---

## Running with Claude Code

1. Open Claude Code in the test project directory (`/tmp/agent-benchmark`)
2. Paste the task prompt from Step 2 above
3. Watch the session
4. After it completes, use the evaluation tables in Steps 4-5

You can also ask Claude Code to self-evaluate:

```
Please self-evaluate your last session against the protocol-adherence
benchmark. For each of the 6 mandatory steps, tell me whether you followed
it. Also note whether you correctly skipped the scaled steps (this was a
quick task). Calculate your mandatory adherence rate.
```

---

## Extending the Benchmarks

To add automated LLM evaluation (rather than manual scoring):

### 1 — Add an LLM client

```js
const USE_LLM = process.env.RUN_LLM_BENCHMARKS === 'true';
const Anthropic = USE_LLM ? require('@anthropic-ai/sdk') : null;
```

### 2 — Replace the stub with a real call

```js
it('executes task against real LLM', async () => {
  if (!USE_LLM) { assert.ok(true); return; }

  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    system: fs.readFileSync('.agent-mind/BOOT.md', 'utf8'),
    messages: [{ role: 'user', content: TASK_PROMPT }]
  });

  const text = response.content[0].text;
  const mandatoryHits = countSignalMatches(text, MANDATORY_STEPS);
  const mandatoryRate = mandatoryHits / MANDATORY_STEPS.length;

  assert.ok(mandatoryRate >= 0.83,
    `Mandatory adherence ${(mandatoryRate * 100).toFixed(1)}% below 83%`);
});
```

### 3 — Run with your API key

```bash
ANTHROPIC_API_KEY=sk-... RUN_LLM_BENCHMARKS=true npm run test:benchmarks
```

---

## Creating New Benchmarks

Copy the existing benchmark to create task-specific ones:

```bash
cp tests/benchmarks/protocol-adherence.test.js tests/benchmarks/compaction-workflow.test.js
```

Good tasks to benchmark:

- **Compaction workflow** — Does the agent correctly scale compaction to the task size?
- **Maintenance trigger** — Does the agent propose maintenance when >2 weeks have elapsed?
- **Failure library update** — After a bug, does the agent add to failures/_index.md?
- **Memory retrieval** — Given an old episode, does the agent load and apply the lessons?
- **Quick vs medium sizing** — Given two tasks of different sizes, does the agent apply different ceremony levels?

Each benchmark should follow the same structure: task definition, mandatory steps, scaled steps, critical rules, and evaluation metrics.
