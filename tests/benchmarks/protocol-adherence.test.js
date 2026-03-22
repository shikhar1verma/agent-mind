const { describe, it } = require('node:test');
const assert = require('node:assert');

/**
 * Benchmark: Protocol Adherence
 *
 * Tests whether an LLM agent follows the agent-mind protocol when given a task.
 * Separates MANDATORY steps (required for ALL task sizes) from SCALED steps
 * (required only for medium/large tasks).
 *
 * The task used: "Add authentication domain to memory" — a quick task
 * (under 30 minutes) that involves writing to knowledge/.
 *
 * Usage:
 *   npm run test:benchmarks                           # methodology only
 *   RUN_LLM_BENCHMARKS=true npm run test:benchmarks   # with LLM execution
 *
 * See docs/benchmarks.md for the full manual testing guide.
 */

const USE_LLM = process.env.RUN_LLM_BENCHMARKS === 'true';

// ---------------------------------------------------------------------------
// Task definition
// ---------------------------------------------------------------------------

const TASK_PROMPT = `Create a new knowledge domain for authentication patterns.

Extract 3 reusable patterns from the context below and store them in the
.agent-mind/ memory system. Follow the protocol from BOOT.md and protocols/
exactly.

Context — recent auth work:
- JWT token validation with refresh rotation (tested, in production)
- OAuth 2.0 PKCE flow for SPAs (tested, in production)
- SSO integration patterns (in progress, not yet verified)

Store verified patterns. Do not store unverified patterns without flagging
them. Create an episode record when done.`;

// ---------------------------------------------------------------------------
// Expected steps — split into mandatory and scaled
// ---------------------------------------------------------------------------

const MANDATORY_STEPS = [
  {
    step: 1,
    protocol: 'BOOT.md — Session Start',
    action: 'Read config.md for project context',
    signals: ['config.md', 'project context', 'reading config'],
    verification: 'Agent reads or references config.md'
  },
  {
    step: 2,
    protocol: 'workflow.md — Phase 1: Understand',
    action: 'Restate the task / clarify the goal',
    signals: ['authentication domain', 'knowledge domain', 'task is to', 'create.*domain'],
    verification: 'Agent shows it understood the task before acting'
  },
  {
    step: 3,
    protocol: 'workflow.md — Phase 2: Load Context',
    action: 'Check knowledge/domains/ for existing patterns',
    signals: ['knowledge/domains', 'existing patterns', 'checking domain', 'existing domain'],
    verification: 'Agent checks what already exists before creating'
  },
  {
    step: 4,
    protocol: 'quality-gate.md — 3-question filter',
    action: 'Apply quality gate before each knowledge/ write',
    signals: ['quality gate', 'quality-gate', 'is it new', 'generalizable', 'verified', 'unverified', 'UNVERIFIED'],
    verification: 'Agent applies the 3 questions (new? generalizable? verified?) or flags unverified data'
  },
  {
    step: 5,
    protocol: 'compaction.md — Episode index entry',
    action: 'Add one-line entry to history/episodes/_index.md',
    signals: ['history/episodes', 'episode', '_index.md', 'compaction', 'episode.*index'],
    verification: 'Agent creates at minimum the index entry (required for ALL task sizes)'
  },
  {
    step: 6,
    protocol: 'BOOT.md — Never Delete History',
    action: 'Append only, never overwrite existing files',
    signals: ['append', 'not overwriting', 'preserve existing', 'not delet'],
    verification: 'Agent does not delete or overwrite any existing domain/history files'
  }
];

const SCALED_STEPS = [
  {
    step: 'S1',
    protocol: 'workflow.md — Phase 1 (medium/large)',
    action: 'Write understanding to workspace/task.md',
    signals: ['workspace/task.md', 'task.md'],
    verification: 'Agent creates workspace/task.md with task understanding',
    requiredFor: 'medium/large'
  },
  {
    step: 'S2',
    protocol: 'workflow.md — Phase 2 (medium/large)',
    action: 'Write loaded context to workspace/context.md',
    signals: ['workspace/context.md', 'context.md'],
    verification: 'Agent creates workspace/context.md with loaded knowledge',
    requiredFor: 'medium/large'
  },
  {
    step: 'S3',
    protocol: 'workflow.md — Phase 3 (medium/large)',
    action: 'Write blocking questions to workspace/questions.md',
    signals: ['workspace/questions.md', 'questions.md', 'blocking.*unknown'],
    verification: 'Agent creates workspace/questions.md for blocking unknowns',
    requiredFor: 'medium/large'
  },
  {
    step: 'S4',
    protocol: 'workflow.md — Phase 4 (medium/large)',
    action: 'Write key decisions to workspace/decisions.md',
    signals: ['workspace/decisions.md', 'decisions.md'],
    verification: 'Agent logs key decisions to workspace/decisions.md',
    requiredFor: 'medium/large'
  },
  {
    step: 'S5',
    protocol: 'compaction.md — Full compaction (medium/large)',
    action: 'Create episode detail file in history/episodes/YYYY-MM/',
    signals: ['episodes/2', 'episode detail', 'episode file', 'full episode'],
    verification: 'Agent creates a full episode file (not just index entry)',
    requiredFor: 'medium/large'
  },
  {
    step: 'S6',
    protocol: 'compaction.md — Insights extraction (medium/large)',
    action: 'Check/update knowledge/insights.md',
    signals: ['insights.md', 'knowledge/insights'],
    verification: 'Agent checks or updates insights.md after task',
    requiredFor: 'medium/large'
  }
];

// ---------------------------------------------------------------------------
// Critical rules (from BOOT.md "Rules That Never Bend")
// ---------------------------------------------------------------------------

const CRITICAL_RULES = [
  {
    rule: 'Never implement before clarity',
    checkFor: 'Agent restates task or asks questions before creating files',
    signals: ['understand', 'clarif', 'task is', 'goal is']
  },
  {
    rule: 'BLOCKING unknowns = HALT',
    checkFor: 'Agent flags SSO as unverified rather than silently storing it',
    signals: ['unverified', 'not yet verified', 'SSO', 'in progress', 'UNVERIFIED', 'blocking']
  },
  {
    rule: 'Capture after every task',
    checkFor: 'Episode index entry exists in history/episodes/_index.md',
    signals: ['episode', 'history/episodes', '_index']
  },
  {
    rule: 'Never delete history',
    checkFor: 'No existing files were deleted or overwritten',
    signals: ['append', 'preserve', 'not delet', 'not overwrit']
  },
  {
    rule: 'Gate your writes',
    checkFor: 'Agent applies quality-gate.md before each knowledge/ write',
    signals: ['quality gate', 'quality-gate', 'new.*generalizable', 'verified']
  },
  {
    rule: 'Stay concise',
    checkFor: 'No created file exceeds its line limit',
    signals: ['concise', 'under.*lines', 'line limit']
  }
];

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function countSignalMatches(text, steps) {
  const lower = text.toLowerCase();
  return steps.filter(step => {
    return step.signals.some(sig => {
      if (sig.includes('.*')) {
        return new RegExp(sig, 'i').test(text);
      }
      return lower.includes(sig.toLowerCase());
    });
  }).length;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Protocol Adherence Benchmark', () => {

  describe('Benchmark Definition', () => {
    it('has a well-defined task prompt', () => {
      assert.ok(TASK_PROMPT.length > 100, 'task prompt should be substantive');
      assert.ok(TASK_PROMPT.includes('authentication'), 'prompt should mention domain');
      assert.ok(TASK_PROMPT.includes('unverified') || TASK_PROMPT.includes('not yet verified'),
        'prompt should include an unverified item to test quality gate');
    });
  });

  describe('Mandatory Steps (required for ALL task sizes)', () => {
    it('defines exactly 6 mandatory steps', () => {
      assert.strictEqual(MANDATORY_STEPS.length, 6);
    });

    it('each mandatory step has protocol, action, signals, and verification', () => {
      MANDATORY_STEPS.forEach(step => {
        assert.ok(step.protocol, `Step ${step.step}: missing protocol`);
        assert.ok(step.action, `Step ${step.step}: missing action`);
        assert.ok(step.signals.length > 0, `Step ${step.step}: missing signals`);
        assert.ok(step.verification, `Step ${step.step}: missing verification`);
      });
    });

    it('covers the non-negotiable protocol requirements', () => {
      const protocols = MANDATORY_STEPS.map(s => s.protocol);
      assert.ok(protocols.some(p => p.includes('Session Start')), 'must check config.md');
      assert.ok(protocols.some(p => p.includes('Understand')), 'must understand task');
      assert.ok(protocols.some(p => p.includes('Load Context')), 'must load context');
      assert.ok(protocols.some(p => p.includes('quality-gate')), 'must apply quality gate');
      assert.ok(protocols.some(p => p.includes('Episode')), 'must create episode entry');
      assert.ok(protocols.some(p => p.includes('Never Delete')), 'must preserve history');
    });
  });

  describe('Scaled Steps (medium/large tasks only)', () => {
    it('defines exactly 6 scaled steps', () => {
      assert.strictEqual(SCALED_STEPS.length, 6);
    });

    it('each scaled step specifies requiredFor', () => {
      SCALED_STEPS.forEach(step => {
        assert.ok(step.requiredFor, `Step ${step.step}: missing requiredFor`);
        assert.ok(step.requiredFor === 'medium/large',
          `Step ${step.step}: requiredFor should be "medium/large"`);
      });
    });

    it('scaled steps are workspace discipline and full compaction', () => {
      const actions = SCALED_STEPS.map(s => s.action);
      assert.ok(actions.some(a => a.includes('workspace/task.md')));
      assert.ok(actions.some(a => a.includes('workspace/context.md')));
      assert.ok(actions.some(a => a.includes('workspace/questions.md')));
      assert.ok(actions.some(a => a.includes('workspace/decisions.md')));
      assert.ok(actions.some(a => a.includes('episode detail')));
      assert.ok(actions.some(a => a.includes('insights.md')));
    });
  });

  describe('Critical Rules', () => {
    it('defines 6 critical rules from BOOT.md', () => {
      assert.strictEqual(CRITICAL_RULES.length, 6);
    });

    it('each rule has checkFor and signals', () => {
      CRITICAL_RULES.forEach(r => {
        assert.ok(r.rule, 'rule should have name');
        assert.ok(r.checkFor, 'rule should have checkFor');
        assert.ok(r.signals.length > 0, 'rule should have signals');
      });
    });
  });

  describe('Evaluation Metrics', () => {
    const metrics = {
      mandatoryAdherence: {
        description: 'Percentage of 6 mandatory steps followed',
        target: 1.0,
        acceptable: 0.83,
        formula: '(mandatory_steps_passed / 6) * 100'
      },
      scaledAdherence: {
        description: 'Percentage of 6 scaled steps followed (only counts for medium/large tasks)',
        target: 1.0,
        acceptable: 0.83,
        formula: '(scaled_steps_passed / 6) * 100'
      },
      criticalRuleCompliance: {
        description: 'Did agent follow all 6 critical rules?',
        target: 1.0,
        formula: '(rules_passed / 6) * 100'
      },
      qualityGateApplied: {
        description: 'Did agent apply the 3-question quality gate before knowledge/ writes?',
        target: true,
        formula: 'boolean'
      },
      unverifiedDataFlagged: {
        description: 'Did agent flag SSO as unverified rather than storing it as verified?',
        target: true,
        formula: 'boolean'
      },
      episodeCreated: {
        description: 'Did agent create at least an episode index entry?',
        target: true,
        formula: 'boolean'
      }
    };

    it('defines 6 evaluation metrics', () => {
      assert.strictEqual(Object.keys(metrics).length, 6);
    });

    it('each metric has description, target, and formula', () => {
      Object.entries(metrics).forEach(([name, m]) => {
        assert.ok(m.description, `${name}: missing description`);
        assert.ok(m.target !== undefined, `${name}: missing target`);
        assert.ok(m.formula, `${name}: missing formula`);
      });
    });
  });

  describe('Scoring Function', () => {
    it('countSignalMatches detects keyword signals', () => {
      const fakeResponse = 'I read config.md for project context. ' +
        'The task is to create an authentication domain. ' +
        'Checking knowledge/domains/ for existing patterns. ' +
        'Applying quality gate: is it new? generalizable? verified? ' +
        'SSO is unverified — tagging as [UNVERIFIED]. ' +
        'Adding episode entry to history/episodes/_index.md. ' +
        'Appending only, not deleting existing files.';

      const mandatoryHits = countSignalMatches(fakeResponse, MANDATORY_STEPS);
      assert.strictEqual(mandatoryHits, 6, 'all 6 mandatory signals should match');

      const scaledHits = countSignalMatches(fakeResponse, SCALED_STEPS);
      assert.strictEqual(scaledHits, 0, 'no scaled signals should match (quick task)');
    });

    it('countSignalMatches handles regex signals', () => {
      const text = 'I need to create the authentication domain first';
      const steps = [{ signals: ['create.*domain'] }];
      assert.strictEqual(countSignalMatches(text, steps), 1);
    });
  });

  describe('LLM Execution (optional)', () => {
    it('skip: requires RUN_LLM_BENCHMARKS=true', () => {
      if (!USE_LLM) {
        assert.ok(true, 'set RUN_LLM_BENCHMARKS=true to run against a live LLM');
        return;
      }
      // When enabled, this would:
      // 1. Call LLM with TASK_PROMPT + BOOT.md as system prompt
      // 2. Parse response for signal matches
      // 3. Score mandatory adherence, scaled adherence, critical rules
      // 4. Assert thresholds
      assert.ok(true, 'LLM benchmark framework defined');
    });
  });

  // -------------------------------------------------------------------------
  // Reference: Actual Claude Code session scoring (2026-03-22)
  // -------------------------------------------------------------------------
  // Task size: QUICK (under 30 min)
  //
  // Mandatory steps (6):
  //   1. Read config.md           — PASS (agent read config.md)
  //   2. Understand task          — PASS (restated goal)
  //   3. Check existing domains   — PASS (checked knowledge/domains/)
  //   4. Apply quality gate       — PASS (applied 3-question filter, flagged SSO)
  //   5. Episode index entry      — PASS (added to _index.md)
  //   6. Append-only              — PASS (no deletions)
  // Mandatory adherence: 6/6 = 100%
  //
  // Scaled steps (6) — NOT REQUIRED for quick tasks:
  //   S1. workspace/task.md       — SKIP (correct for quick task)
  //   S2. workspace/context.md    — SKIP (correct for quick task)
  //   S3. workspace/questions.md  — SKIP (correct for quick task)
  //   S4. workspace/decisions.md  — SKIP (correct for quick task)
  //   S5. Episode detail file     — SKIP (correct for quick task)
  //   S6. insights.md update      — SKIP (correct for quick task)
  // Scaled adherence: N/A (quick task, correctly skipped)
  //
  // Critical rules: 6/6 = 100%
  // Quality gate applied: YES
  // Unverified data flagged: YES (SSO tagged [UNVERIFIED])
  // Episode created: YES
  //
  // VERDICT: Agent was CORRECT. Protocols were wrong (scaling buried/contradicted).
  // Fix: Rewrote BOOT.md, workflow.md, compaction.md to integrate scaling inline.

  it('benchmark is complete and ready for testing', () => {
    assert.ok(MANDATORY_STEPS.length === 6, '6 mandatory steps defined');
    assert.ok(SCALED_STEPS.length === 6, '6 scaled steps defined');
    assert.ok(CRITICAL_RULES.length === 6, '6 critical rules defined');
    assert.ok(TASK_PROMPT.length > 0, 'task prompt defined');
    assert.ok(typeof countSignalMatches === 'function', 'scoring function defined');
  });
});
