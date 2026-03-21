const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { copyTemplate, replaceVarsInDir } = require('../src/utils/template');

/**
 * Tests the template copy and variable substitution.
 * Verifies that template can be copied, variables can be replaced,
 * and no placeholders remain after substitution.
 */

describe('Template Operations', () => {
  let tempDir;

  // Create a temporary directory for tests
  it('setup: create temporary directory', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-mind-test-'));
    assert.ok(fs.existsSync(tempDir), 'temp directory should be created');
  });

  describe('Template Copy', () => {
    let copyDir;

    it('copy template to temp directory', () => {
      copyDir = path.join(tempDir, 'copy-test');
      assert.doesNotThrow(() => {
        copyTemplate(copyDir);
      }, 'should copy template without errors');
      assert.ok(fs.existsSync(copyDir), 'copied template should exist');
    });

    it('all required files are present in copy', () => {
      const requiredFiles = [
        'BOOT.md',
        'config.md',
        'VERSION.md',
        'protocols/workflow.md',
        'adapters/claude.md',
        'knowledge/insights.md'
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(copyDir, file);
        assert.ok(fs.existsSync(filePath),
          `File ${file} should be present in copied template`);
      });
    });

    it('all required directories are present in copy', () => {
      const requiredDirs = [
        'protocols',
        'adapters',
        'knowledge',
        'history',
        'workspace',
        '.am-tools'
      ];

      requiredDirs.forEach(dir => {
        const dirPath = path.join(copyDir, dir);
        assert.ok(fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory(),
          `Directory ${dir} should be present in copied template`);
      });
    });
  });

  describe('Variable Substitution', () => {
    let substDir;

    it('copy template for substitution test', () => {
      substDir = path.join(tempDir, 'subst-test');
      copyTemplate(substDir);
      assert.ok(fs.existsSync(substDir), 'template should be copied');
    });

    it('replace variables in copied template', () => {
      const variables = {
        PROJECT_NAME: 'Test Project',
        PROJECT_DESCRIPTION: 'A test project for agent-mind',
        DATE: '2025-03-22',
        VERSION: '1.0.0',
        PRIMARY_AGENT: 'Claude Code',
        DOMAINS: '- authentication\n- api-design',
        STACK: '- JavaScript\n- Node.js'
      };

      assert.doesNotThrow(() => {
        replaceVarsInDir(substDir, variables);
      }, 'should replace variables without errors');
    });

    it('config.md has substituted values', () => {
      const configPath = path.join(substDir, 'config.md');
      const content = fs.readFileSync(configPath, 'utf8');

      assert.ok(content.includes('Test Project'),
        'PROJECT_NAME should be substituted');
      assert.ok(content.includes('A test project for agent-mind'),
        'PROJECT_DESCRIPTION should be substituted');
      assert.ok(content.includes('2025-03-22'),
        'DATE should be substituted');
      assert.ok(content.includes('Claude Code'),
        'PRIMARY_AGENT should be substituted');
    });

    it('VERSION.md has substituted values', () => {
      const versionPath = path.join(substDir, 'VERSION.md');
      const content = fs.readFileSync(versionPath, 'utf8');

      assert.ok(content.includes('2025-03-22'),
        'DATE should be substituted in VERSION.md');
    });

    it('no remaining {{PLACEHOLDER}} strings after substitution', () => {
      const placeholderRegex = /\{\{[A-Z_]+\}\}/g;
      let foundPlaceholders = [];

      function checkDir(dir) {
        const entries = fs.readdirSync(dir);

        entries.forEach(entry => {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            checkDir(fullPath);
          } else if (entry.endsWith('.md')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.match(placeholderRegex);
            if (matches) {
              foundPlaceholders.push({
                file: path.relative(substDir, fullPath),
                placeholders: matches
              });
            }
          }
        });
      }

      checkDir(substDir);

      assert.strictEqual(foundPlaceholders.length, 0,
        `Found placeholders after substitution: ${JSON.stringify(foundPlaceholders, null, 2)}`);
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
