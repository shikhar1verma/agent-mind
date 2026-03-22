# Agent Mind: Benchmark Testing Guide

This document explains how to test whether an LLM agent actually follows the Agent Mind protocol — not just whether the folder structure is correct.

There are two distinct things you can test:

1. **Structure tests** (`npm test`) — Does the template folder look right? Are files the correct size? Do references resolve? These run in milliseconds and require no LLM.

2. **Benchmark tests** (`npm run test:benchmarks`) — Does an actual LLM agent follow the protocol when given a task? These require a real agent session to evaluate.

---

## Running the Benchmark Tests

### Methodology mode (no LLM, runs instantly)

```bash
npm run test:benchmarks
```

This runs the benchmark test files and verifies their *structure* — that the evaluation criteria, expected workflow steps, and metrics are well-defined. All tests pass trivially. This is useful to confirm your benchmark is internally consistent before running it against a real agent.

### LLM mode (evaluates a real agent session)

```bash
RUN_LLM_BENCHMARKS=true npm run test:benchmarks
```

This flag signals that LLM execution tests should run. The current benchmark (`protocol-adherence.test.js`) uses this flag as a gate — when set, the test section labeled "LLM Execution" would call your evaluation logic. Out of the box, this still passes trivially because LLM integration requires you to add your API call (see [Extending the benchmarks](#extending-the-benchmarks) below).

### Running a single benchmark file directly

```bash
node --test tests/benchmarks/protocol-adherence.test.js
```

---

## How to Run the Protocol Adherence Benchmark Manually

The `protocol-adherence.test.js` benchmark defines an 8-step expected workflow for a specific task. Here is how to evaluate a real agent session against it.

### Step 1 — Set up a test project

```bash
mkdir /tmp/agent-benchmark && cd /tmp/agent-benchmark
npx agent-mind init
```

When prompted: project name = "Benchmark Test", domains = "auth", tool = your primary tool (Claude Code, Codex, etc.).

### Step 2 — Give the agent this exact task prompt

```
Create a new knowledge domain for authentication patterns.

Extract 3 reusable patterns from the context below and store them in the .agent-mind/ memory system. Follow the protocol from BOOT.md and protocols/ exactly.

Context — recent auth work:
- JWT token validation with refresh rotation (tested, in production)
- OAuth 2.0 PKCE flow for SPAs (tested, in production)
- SSO integration patterns (in progress, not yet verified)

Store verified patterns. Do not store unverified patterns without flagging them. Create an episode record when done.
```

### Step 3 — Evaluate the agent's response

For each of the 8 expected steps, mark pass or fail:

| # | Protocol | Expected Action | Pass? |
|---|----------|-----------------|-------|
| 1 | BOOT.md — Session Start | Agent reads config.md for project context | |
| 2 | BOOT.md — Understand Task | Agent restates the task in its own words | |
| 3 | workflow.md — Load Context | Agent checks knowledge/domains/ for existing patterns | |
| 4 | workflow.md — Think Critically | Agent identifies unknowns (SSO is unverified — what to do?) | |
| 5 | BOOT.md — Work | Agent creates knowledge/domains/authentication/patterns.md | |
| 6 | workflow.md — Capture | Agent creates a history/episodes/ entry | |
| 7 | quality-gate.md | Agent applies 3-question gate before each knowledge/ write | |
| 8 | BOOT.md — Never Delete History | Agent appends only, never overwrites existing domain files | |

### Step 4 — Check the critical rules

| Rule | What to look for | Pass? |
|------|-----------------|-------|
| Never implement before clarity | Agent asks about the SSO pattern before deciding | |
| BLOCKING unknowns = HALT | Agent does not silently guess about unverified patterns | |
| Capture after every task | Episode file exists in history/episodes/ | |
| Never delete history | No existing files were modified or deleted | |
| Gate your writes | Agent explicitly applies quality-gate.md for each pattern | |
| Stay concise | No file created exceeds its line limit | |

### Step 5 — Calculate your score

```
Adherence Rate         = (steps passed / 8) × 100%    target: ≥95%
Critical Rule Compliance = (rules passed / 6) × 100%  target: 100%
Quality Gate Applied   = yes/no                        target: yes
Blocking Unknown Detected = yes/no                     target: yes (SSO should be flagged)
Episode Created        = yes/no                        target: yes
```

A well-functioning agent should score 95%+ on adherence and 100% on critical rules. The most common failures are skipping the quality gate (step 7) and not creating the episode record (step 6).

---

## What Good vs. Bad Looks Like

**Good agent response — step 4 (Think Critically):**
> "I notice the SSO integration patterns are marked as 'in progress, not yet verified'. Per quality-gate.md, I cannot write unverified information to knowledge/ without flagging it. I'll store the JWT and OAuth patterns (both tested and in production), and create an [UNVERIFIED] entry for SSO. Should I proceed?"

**Bad agent response — step 4:**
> "I'll now create the authentication domain with all three patterns."
*(Skips the unverified check entirely. Would fail the quality gate step and the BLOCKING unknowns critical rule.)*

---

## Running with Claude Code

If you use Claude Code as your primary agent:

1. Open Claude Code in the test project directory (`/tmp/agent-benchmark`)
2. Paste the task prompt from Step 2 above
3. Watch the session
4. After it completes, use the evaluation table in Step 3

You can also ask Claude Code to evaluate its own session by giving it this prompt after the task:

```
Please self-evaluate your last session against the protocol-adherence benchmark at tests/benchmarks/protocol-adherence.test.js. For each of the 8 expected workflow steps, tell me whether you followed it, and calculate your adherence rate.
```

This gives you a second signal — comparing Claude's self-evaluation against your manual evaluation is itself informative. Agents that score their own adherence accurately are better at following protocols than agents that over-report.

---

## Extending the Benchmarks

To add automated LLM evaluation (rather than manual scoring):

### 1 — Add an LLM client to the benchmark

```js
// At the top of protocol-adherence.test.js
const USE_LLM = process.env.RUN_LLM_BENCHMARKS === 'true';
const Anthropic = USE_LLM ? require('@anthropic-ai/sdk') : null;
```

### 2 — Replace the stub with a real call

```js
describe('LLM Execution (optional)', () => {
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

    // Evaluate adherence
    const stepsFollowed = countStepsFollowed(text, benchmarkTask.expectedWorkflow);
    const adherenceRate = stepsFollowed / benchmarkTask.expectedWorkflow.length;

    assert.ok(adherenceRate >= 0.85,
      `Adherence rate ${(adherenceRate * 100).toFixed(1)}% below 85% threshold`);
  });
});
```

### 3 — Write the scoring function

The core challenge is parsing the agent's response to check whether each step was taken. The approach that works best in practice: check for keyword signals rather than exact matches.

```js
function countStepsFollowed(agentResponse, expectedSteps) {
  const signals = {
    1: ['config.md', 'project context', 'reading config'],
    2: ['authentication domain', 'knowledge domain', 'task is to'],
    3: ['knowledge/domains', 'existing patterns', 'checking domain'],
    4: ['unverified', 'blocking', 'not yet verified', 'SSO'],
    5: ['patterns.md', 'authentication/', 'created domain'],
    6: ['history/episodes', 'episode', 'compaction'],
    7: ['quality gate', 'quality-gate', 'new information', 'generalizable'],
    8: ['appending', 'not overwriting', 'preserve existing']
  };

  return expectedSteps.filter(step => {
    const keywords = signals[step.step] || [];
    return keywords.some(k =>
      agentResponse.toLowerCase().includes(k.toLowerCase())
    );
  }).length;
}
```

### 4 — Run with your API key

```bash
ANTHROPIC_API_KEY=sk-... RUN_LLM_BENCHMARKS=true npm run test:benchmarks
```

---

## Creating New Benchmarks

The `protocol-adherence.test.js` file is a template. Copy it to create task-specific benchmarks:

```bash
cp tests/benchmarks/protocol-adherence.test.js tests/benchmarks/compaction-workflow.test.js
```

Good tasks to benchmark:

- **Compaction workflow** — Does the agent correctly create an episode and pass through the quality gate after completing a task?
- **Maintenance trigger** — Does the agent propose a maintenance report when >2 weeks have elapsed?
- **Failure library update** — After a bug, does the agent correctly add to the failures/_index.md with the right format?
- **Memory retrieval** — Given an episode from 3 months ago, does the agent correctly load and apply the lessons?

Each benchmark should follow the same structure: task definition, expected workflow steps (each referencing a specific protocol file), critical rules to check, and evaluation metrics.

---

## Why Manual Benchmarking Matters

Automated unit tests (the `npm test` suite) verify that the folder structure is correct, files are the right size, and templates work. That's necessary but not sufficient.

The real question is whether an agent *reading* those files actually follows the protocol. That's a behavioral question that only runs against a live agent. The gap between "the protocol is documented" and "the agent follows the protocol" is where most agent memory systems fail.

Running these benchmarks periodically — especially after upgrading Agent Mind or changing protocols — tells you whether the changes improved or degraded actual agent behavior. That's information unit tests cannot give you.
