const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

/**
 * Tests that all files are under their stated size limits.
 * Enforces the design principle: <200 line files for high adherence.
 */

const TEMPLATE_PATH = path.join(__dirname, '../template');

const SIZE_LIMITS = {
  'BOOT.md': 150,
  'config.md': 100,
  'VERSION.md': 100,
  'protocols/compaction.md': 200,
  'protocols/maintenance.md': 200,
  'protocols/memory-ops.md': 200,
  'protocols/quality-gate.md': 200,
  'protocols/workflow.md': 200,
  'knowledge/insights.md': 200,
  'knowledge/domains/_template/patterns.md': 200,
  'knowledge/domains/_template/failures/_index.md': 200,
  'knowledge/stack/_template.md': 200,
  'history/episodes/_index.md': 200,
  'history/reflections/_index.md': 200,
  'history/maintenance-log.md': 200,
  'adapters/claude.md': 100,
  'adapters/codex.md': 100,
  'adapters/gemini.md': 100,
  'adapters/cursor.md': 100
  // Note: .am-tools/guide.md is documentation (not core) and exempt from size limits
};

/**
 * Count lines in a file
 */
function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
}

describe('File Sizes', () => {
  describe('Size Limits', () => {
    Object.entries(SIZE_LIMITS).forEach(([relPath, limit]) => {
      it(`${relPath} < ${limit} lines`, () => {
        const fullPath = path.join(TEMPLATE_PATH, relPath);
        assert.ok(fs.existsSync(fullPath), `File ${relPath} should exist`);

        const lineCount = countLines(fullPath);
        assert.ok(lineCount <= limit,
          `${relPath} has ${lineCount} lines, limit is ${limit}`);
      });
    });
  });

  it('summary: all files within size limits', () => {
    const violations = [];

    Object.entries(SIZE_LIMITS).forEach(([relPath, limit]) => {
      const fullPath = path.join(TEMPLATE_PATH, relPath);
      if (fs.existsSync(fullPath)) {
        const lineCount = countLines(fullPath);
        if (lineCount > limit) {
          violations.push({
            file: relPath,
            lines: lineCount,
            limit: limit,
            excess: lineCount - limit
          });
        }
      }
    });

    assert.strictEqual(violations.length, 0,
      `Files exceed size limits: ${JSON.stringify(violations, null, 2)}`);
  });
});
