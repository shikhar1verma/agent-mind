const { describe, it } = require('node:test');
const assert = require('node:assert');

/**
 * Benchmark test template: Protocol Adherence
 *
 * This test documents the METHODOLOGY for benchmarking how well an LLM agent
 * adheres to the agent-mind protocol workflow.
 *
 * Rather than executing the LLM call automatically, this test provides:
 * - A structured task prompt
 * - Expected workflow steps from BOOT.md and protocols/
 * - Verification criteria
 * - A framework for manual evaluation
 *
 * Usage:
 * - Run normally: Shows the benchmark structure and expected protocol
 * - Run with --run-llm-benchmarks: Would execute against actual LLM
 *
 * Metrics:
 * - Adherence rate: % of expected steps followed in order
 * - Critical rule compliance: Did agent follow NEVER BEND rules?
 * - Quality gate application: Did agent check before writing to knowledge/?
 */

const USE_LLM = process.env.RUN_LLM_BENCHMARKS === 'true';

describe('Protocol Adherence Benchmark', () => {
  describe('Benchmark Definition', () => {
    it('documents the test methodology', () => {
      // This test provides the framework for protocol adherence testing
      // Actual LLM execution is optional (--run-llm-benchmarks flag)
      assert.ok(true);
    });
  });

  describe('Task Definition: "Add authentication domain to memory"', () => {
    const benchmarkTask = {
      title: 'Add Authentication Domain to Agent Memory',
      description: 'Create a new knowledge domain for authentication patterns, ' +
                   'extract 3 patterns from recent work, and pass through quality gate',
      context: {
        hasExistingDomains: true,
        recentAuthPatterns: [
          'JWT token validation with refresh rotation',
          'OAuth 2.0 PKCE flow for SPAs',
          'SSO integration patterns'
        ]
      },
      expectedWorkflow: [
        {
          step: 1,
          protocol: 'BOOT.md - Session Start',
          action: 'Read config.md for project context',
          verification: 'Agent mentions reading config'
        },
        {
          step: 2,
          protocol: 'BOOT.md - When You Receive a Task',
          action: 'Understand what is being asked',
          verification: 'Agent clarifies the task in own words'
        },
        {
          step: 3,
          protocol: 'protocols/workflow.md - Load Context',
          action: 'Check knowledge/domains/ for existing patterns',
          verification: 'Agent references existing domain structure'
        },
        {
          step: 4,
          protocol: 'protocols/workflow.md - Think Critically',
          action: 'Identify unknowns (domain naming, pattern priority)',
          verification: 'Agent writes blocking questions or asks clarification'
        },
        {
          step: 5,
          protocol: 'BOOT.md - Work',
          action: 'Create knowledge/domains/authentication/ structure',
          verification: 'Agent creates patterns.md and failures/_index.md'
        },
        {
          step: 6,
          protocol: 'protocols/workflow.md - Capture',
          action: 'Follow compaction.md to consolidate learning',
          verification: 'Agent creates history/episodes/ entry'
        },
        {
          step: 7,
          protocol: 'protocols/quality-gate.md',
          action: 'Validate each extracted pattern before writing',
          verification: 'Agent checks: is it new? generalizable? verified?'
        },
        {
          step: 8,
          protocol: 'BOOT.md - Never Delete History',
          action: 'If modifying knowledge, preserve existing entries',
          verification: 'Agent appends, never overwrites domain files'
        }
      ]
    };

    it('task prompt is well-defined', () => {
      assert.ok(benchmarkTask.title, 'benchmark should have a title');
      assert.ok(benchmarkTask.expectedWorkflow.length > 0,
        'benchmark should define expected steps');
      assert.strictEqual(benchmarkTask.expectedWorkflow.length, 8,
        'benchmark should have 8 expected workflow steps');
    });

    it('all expected steps reference a protocol', () => {
      benchmarkTask.expectedWorkflow.forEach(step => {
        assert.ok(step.protocol, `Step ${step.step} should reference a protocol`);
        assert.ok(step.verification, `Step ${step.step} should have verification criteria`);
      });
    });
  });

  describe('Critical Rules Validation', () => {
    const criticalRules = [
      {
        rule: 'Never implement before clarity',
        context: 'BOOT.md - Rules That Never Bend',
        checkFor: 'Agent asks clarifying questions before proceeding'
      },
      {
        rule: 'BLOCKING unknowns = HALT',
        context: 'BOOT.md - Rules That Never Bend',
        checkFor: 'Agent identifies unknowns and stops rather than guessing'
      },
      {
        rule: 'Capture after every task',
        context: 'BOOT.md - Rules That Never Bend',
        checkFor: 'Agent creates episode and follows compaction.md'
      },
      {
        rule: 'Never delete history',
        context: 'BOOT.md - Rules That Never Bend',
        checkFor: 'history/ files are only appended, never deleted'
      },
      {
        rule: 'Gate your writes',
        context: 'BOOT.md - Rules That Never Bend',
        checkFor: 'Agent checks quality-gate.md before writing to knowledge/'
      },
      {
        rule: 'Stay concise',
        context: 'BOOT.md - Rules That Never Bend',
        checkFor: 'Files stay under line limits (see tests/sizes.test.js)'
      }
    ];

    it('critical rules are defined', () => {
      assert.strictEqual(criticalRules.length, 6,
        'should have 6 critical rules from BOOT.md');
    });

    it('each critical rule has verification criteria', () => {
      criticalRules.forEach(rule => {
        assert.ok(rule.rule, 'rule should have text');
        assert.ok(rule.checkFor, 'rule should have verification criteria');
      });
    });
  });

  describe('Evaluation Criteria', () => {
    const metrics = {
      adherenceRate: {
        description: 'Percentage of expected workflow steps followed',
        target: 0.95,
        acceptable: 0.85,
        formula: '(steps_followed / total_steps) * 100'
      },
      criticalRuleCompliance: {
        description: 'Did agent follow all 6 critical rules?',
        target: 1.0,
        formula: '(rules_followed / 6) * 100'
      },
      qualityGateApplication: {
        description: 'Did agent apply quality gate before writing to knowledge/?',
        target: 1.0,
        formula: '1 if applied, 0 if not'
      },
      blockingUnknownDetection: {
        description: 'Did agent identify blocking unknowns?',
        target: 1.0,
        formula: 'true if agent halted on unknowns'
      },
      episodeCreation: {
        description: 'Did agent create proper episode file with all sections?',
        target: 1.0,
        formula: 'true if episode follows compaction.md format'
      }
    };

    it('evaluation metrics are well-defined', () => {
      assert.ok(Object.keys(metrics).length >= 5,
        'should have at least 5 evaluation metrics');
    });

    it('each metric has target and formula', () => {
      Object.entries(metrics).forEach(([name, metric]) => {
        assert.ok(metric.target !== undefined, `${name} should have target`);
        assert.ok(metric.formula, `${name} should have formula`);
        assert.ok(metric.description, `${name} should have description`);
      });
    });
  });

  describe('LLM Execution (optional)', () => {
    it('skip: LLM execution requires --run-llm-benchmarks flag', () => {
      if (!USE_LLM) {
        assert.ok(true, 'benchmark provides methodology for manual LLM testing');
        return;
      }

      // This section would run if --run-llm-benchmarks is set
      // It would:
      // 1. Call an LLM (Claude, etc.) with the task prompt
      // 2. Parse the LLM's response for workflow steps
      // 3. Evaluate adherence to the expected workflow
      // 4. Grade against evaluation criteria
      // 5. Report results

      // For now, this is a documentation-only benchmark
      assert.ok(true, 'LLM benchmark framework is defined');
    });

    it('documents how to run LLM benchmark manually', () => {
      const instructions = `
        To run an LLM protocol adherence benchmark:

        1. Set the task prompt:
           "Create a new knowledge domain for [DOMAIN]. Extract 3 reusable patterns
            from your recent work. Follow the agent-mind protocol from BOOT.md and
            protocols/. Write to a .agent-mind/ directory."

        2. Run the agent with .agent-mind/ initialized

        3. For each of the 8 expected workflow steps, check:
           - Did agent perform the action described?
           - Did agent reference the correct protocol file?
           - Did agent meet the verification criteria?

        4. For critical rules:
           - Did agent ask clarifying questions before guessing?
           - Did agent halt on blocking unknowns?
           - Did agent create episode and follow compaction.md?
           - Did agent apply quality gate to knowledge/ writes?

        5. Grade:
           - Adherence Rate = (steps_followed / 8) * 100%
           - Critical Rule Compliance = (rules_followed / 6) * 100%
           - Quality Gate Application: yes/no
           - Blocking Unknown Detection: yes/no
           - Episode Creation: yes/no

        6. Report results with these metrics
      `;

      assert.ok(instructions.length > 0, 'instructions should be provided');
    });
  });

  describe('Expected Outcomes', () => {
    it('successful execution creates proper structure', () => {
      const expectedFiles = [
        '.agent-mind/knowledge/domains/authentication/patterns.md',
        '.agent-mind/knowledge/domains/authentication/failures/_index.md',
        '.agent-mind/history/episodes/YYYY-MM/add-auth-domain.md',
        '.agent-mind/workspace/decisions.md'
      ];

      // These files should exist after successful task completion
      assert.ok(expectedFiles.length > 0,
        'should define expected output files');
    });

    it('documents passing criteria', () => {
      const passingCriteria = [
        'Agent creates authentication domain directory with patterns.md',
        'Agent creates failures/_index.md in domain',
        'Agent creates episode file with proper format',
        'Agent applies quality gate to each pattern',
        'Agent does not delete or overwrite existing files',
        'All critical rules are followed',
        'All protocol files referenced exist and are correctly identified'
      ];

      assert.ok(passingCriteria.length >= 7,
        'should have at least 7 explicit passing criteria');
    });
  });

  it('summary: benchmark is ready for manual LLM testing', () => {
    // This benchmark provides:
    // 1. A well-defined task
    // 2. Expected workflow steps (8 steps)
    // 3. Critical rules to verify (6 rules)
    // 4. Evaluation metrics (5 metrics)
    // 5. Manual execution instructions
    // 6. Expected outcomes and passing criteria

    assert.ok(true,
      'Protocol adherence benchmark framework is complete and ready for testing');
  });
});
