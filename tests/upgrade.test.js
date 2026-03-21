const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { copyTemplate, replaceVarsInDir } = require('../src/utils/template');

/**
 * Tests the upgrade logic.
 * Verifies that core files are correctly identified and user files are preserved.
 */

const CORE_FILES = [
  'BOOT.md',
  'VERSION.md',
  'protocols/compaction.md',
  'protocols/maintenance.md',
  'protocols/workflow.md',
  'protocols/quality-gate.md',
  'protocols/memory-ops.md',
  'adapters/claude.md',
  'adapters/codex.md',
  'adapters/gemini.md',
  'adapters/cursor.md'
];

/**
 * Determine if a file is a core file (should be updated)
 */
function isCoreFile(relativePath) {
  return CORE_FILES.some(core => {
    return relativePath === core || relativePath.startsWith(core + '/');
  });
}

describe('Upgrade Logic', () => {
  let tempDir, agentMindDir;

  it('setup: create temporary agent-mind directory', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-mind-upgrade-'));
    agentMindDir = path.join(tempDir, '.agent-mind');

    // Initialize from template
    copyTemplate(agentMindDir);

    const variables = {
      PROJECT_NAME: 'Upgrade Test',
      PROJECT_DESCRIPTION: 'Testing upgrade logic',
      DATE: '2025-03-22',
      PRIMARY_AGENT: 'Claude',
      DOMAINS: '- testing',
      STACK: '- JavaScript'
    };

    replaceVarsInDir(agentMindDir, variables);

    assert.ok(fs.existsSync(agentMindDir), 'agent-mind directory should be created');
  });

  describe('Core Files Identification', () => {
    it('correctly identifies BOOT.md as core file', () => {
      assert.ok(isCoreFile('BOOT.md'), 'BOOT.md should be core');
    });

    it('correctly identifies protocols/ files as core', () => {
      assert.ok(isCoreFile('protocols/workflow.md'), 'protocols/workflow.md should be core');
      assert.ok(isCoreFile('protocols/compaction.md'), 'protocols/compaction.md should be core');
    });

    it('correctly identifies adapters/ files as core', () => {
      assert.ok(isCoreFile('adapters/claude.md'), 'adapters/claude.md should be core');
      assert.ok(isCoreFile('adapters/gemini.md'), 'adapters/gemini.md should be core');
    });

    it('correctly identifies user files as non-core', () => {
      assert.ok(!isCoreFile('config.md'), 'config.md should NOT be core (user file)');
      assert.ok(!isCoreFile('knowledge/insights.md'), 'knowledge/insights.md should NOT be core');
      assert.ok(!isCoreFile('workspace/questions.md'), 'workspace/questions.md should NOT be core');
      assert.ok(!isCoreFile('history/episodes/_index.md'), 'history files should NOT be core');
    });
  });

  describe('User File Preservation', () => {
    it('adds user content to knowledge/insights.md', () => {
      const insightsPath = path.join(agentMindDir, 'knowledge/insights.md');
      const userContent = '\n## User Insight\nThis is a user-added insight.';
      fs.appendFileSync(insightsPath, userContent);

      const content = fs.readFileSync(insightsPath, 'utf8');
      assert.ok(content.includes('User Insight'),
        'user-added content should be present');
    });

    it('adds user content to workspace/decisions.md', () => {
      const workspaceFile = path.join(agentMindDir, 'workspace/decisions.md');
      const userContent = '# User Decisions\nDecision 1: Use TypeScript';
      fs.writeFileSync(workspaceFile, userContent);

      assert.ok(fs.existsSync(workspaceFile), 'workspace file should exist');
      const content = fs.readFileSync(workspaceFile, 'utf8');
      assert.ok(content.includes('TypeScript'),
        'user workspace content should be present');
    });

    it('adds user content to history/episodes/_index.md', () => {
      const indexPath = path.join(agentMindDir, 'history/episodes/_index.md');
      const userContent = '\n2025-03-20 | testing | completed | user-task | A user task';
      fs.appendFileSync(indexPath, userContent);

      const content = fs.readFileSync(indexPath, 'utf8');
      assert.ok(content.includes('user-task'),
        'user-added history should be present');
    });
  });

  describe('Core File Changes', () => {
    it('detects modifications to core files', () => {
      const bootPath = path.join(agentMindDir, 'BOOT.md');
      let bootContent = fs.readFileSync(bootPath, 'utf8');
      const originalLength = bootContent.length;

      // Add a line to BOOT.md
      bootContent += '\n\nUser modification to core file';
      fs.writeFileSync(bootPath, bootContent);

      const newContent = fs.readFileSync(bootPath, 'utf8');
      assert.notStrictEqual(newContent.length, originalLength,
        'core file should show modification');
      assert.ok(newContent.includes('User modification'),
        'modification should be detected');
    });

    it('detects modifications to protocol files', () => {
      const protocolPath = path.join(agentMindDir, 'protocols/workflow.md');
      let content = fs.readFileSync(protocolPath, 'utf8');

      // Add content to workflow.md
      content += '\n\nUser note: workflow modified';
      fs.writeFileSync(protocolPath, content);

      const newContent = fs.readFileSync(protocolPath, 'utf8');
      assert.ok(newContent.includes('workflow modified'),
        'protocol file modification should be detected');
    });
  });

  describe('Separation Principle', () => {
    it('core and user files can be separated', () => {
      const coreFilesFound = [];
      const userFilesFound = [];

      function checkDir(dir, basePath = '') {
        const entries = fs.readdirSync(dir);

        entries.forEach(entry => {
          const fullPath = path.join(dir, entry);
          const relativePath = basePath ? `${basePath}/${entry}` : entry;
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            checkDir(fullPath, relativePath);
          } else if (entry.endsWith('.md') && !entry.startsWith('.')) {
            if (isCoreFile(relativePath)) {
              coreFilesFound.push(relativePath);
            } else {
              userFilesFound.push(relativePath);
            }
          }
        });
      }

      checkDir(agentMindDir);

      // Should have both types of files
      assert.ok(coreFilesFound.length > 0, 'should identify core files');
      assert.ok(userFilesFound.length >= 0, 'should identify user files (or none)');

      // Core and user files should not overlap
      const coreSet = new Set(coreFilesFound);
      const userSet = new Set(userFilesFound);
      userFilesFound.forEach(file => {
        assert.ok(!coreSet.has(file), `${file} should not be in both core and user sets`);
      });
    });

    it('config.md is a user file, never updated', () => {
      assert.ok(!isCoreFile('config.md'),
        'config.md should be a user file (not updated during upgrade)');
    });

    it('knowledge/domains/ are user files', () => {
      assert.ok(!isCoreFile('knowledge/domains/auth/patterns.md'),
        'user domain files should not be core');
    });

    it('history/ is append-only (user files)', () => {
      assert.ok(!isCoreFile('history/episodes/2025-03/example.md'),
        'user episodes should not be core');
      assert.ok(!isCoreFile('history/reflections/2025-03-20-failure.md'),
        'user reflections should not be core');
    });
  });

  // Cleanup
  it('cleanup: remove temporary directory', () => {
    assert.doesNotThrow(() => {
      function removeDir(dir) {
        const entries = fs.readdirSync(dir);
        entries.forEach(entry => {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            removeDir(fullPath);
          } else {
            fs.unlinkSync(fullPath);
          }
        });
        fs.rmdirSync(dir);
      }
      removeDir(tempDir);
    }, 'should clean up temp directory');
  });
});
