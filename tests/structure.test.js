const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

/**
 * Tests that the template/ directory has all required files and directories.
 * This is the structural validation for the agent-mind template.
 */

const TEMPLATE_PATH = path.join(__dirname, '../template');

const REQUIRED_DIRS = [
  'protocols',
  'knowledge/domains/_template/failures',
  'knowledge/stack',
  'workspace',
  'history/episodes',
  'history/reflections',
  'adapters',
  '.am-tools'
];

const REQUIRED_FILES = [
  'BOOT.md',
  'config.md',
  'VERSION.md',
  'protocols/workflow.md',
  'protocols/memory-ops.md',
  'protocols/compaction.md',
  'protocols/quality-gate.md',
  'protocols/maintenance.md',
  'knowledge/insights.md',
  'knowledge/domains/_template/patterns.md',
  'knowledge/domains/_template/failures/_index.md',
  'knowledge/stack/_template.md',
  'history/episodes/_index.md',
  'history/reflections/_index.md',
  'history/maintenance-log.md',
  'adapters/claude.md',
  'adapters/codex.md',
  'adapters/gemini.md',
  'adapters/cursor.md',
  '.am-tools/guide.md',
  '.am-tools/compact.sh',
  '.am-tools/health-check.sh',
  '.am-tools/validate.sh',
  'workspace/.gitkeep'
];

/**
 * Collect all files and directories in the template
 */
function collectFileSystem(dir, basePath = '') {
  const items = {
    dirs: new Set(),
    files: new Set()
  };

  const entries = fs.readdirSync(dir);

  entries.forEach(entry => {
    // Skip .gitignore - it's okay to have
    if (entry === '.gitignore') {
      return;
    }

    const fullPath = path.join(dir, entry);
    const relativePath = basePath ? `${basePath}/${entry}` : entry;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      items.dirs.add(relativePath);
      const subItems = collectFileSystem(fullPath, relativePath);
      subItems.dirs.forEach(d => items.dirs.add(d));
      subItems.files.forEach(f => items.files.add(f));
    } else {
      items.files.add(relativePath);
    }
  });

  return items;
}

describe('Template Structure', () => {
  it('template directory exists', () => {
    assert.ok(fs.existsSync(TEMPLATE_PATH), 'template directory should exist');
    assert.ok(fs.statSync(TEMPLATE_PATH).isDirectory(), 'template should be a directory');
  });

  describe('Required Directories', () => {
    REQUIRED_DIRS.forEach(dir => {
      it(`directory exists: ${dir}`, () => {
        const fullPath = path.join(TEMPLATE_PATH, dir);
        assert.ok(fs.existsSync(fullPath), `Directory ${dir} should exist`);
        assert.ok(fs.statSync(fullPath).isDirectory(), `${dir} should be a directory`);
      });
    });
  });

  describe('Required Files', () => {
    REQUIRED_FILES.forEach(file => {
      it(`file exists: ${file}`, () => {
        const fullPath = path.join(TEMPLATE_PATH, file);
        assert.ok(fs.existsSync(fullPath), `File ${file} should exist`);
        assert.ok(fs.statSync(fullPath).isFile(), `${file} should be a file`);
      });
    });
  });

  it('no unexpected files outside expected set', () => {
    const fs_items = collectFileSystem(TEMPLATE_PATH);

    const expectedFiles = new Set(REQUIRED_FILES);
    const expectedDirs = new Set(REQUIRED_DIRS);

    const allowedDirs = new Set([
      ...REQUIRED_DIRS,
      'knowledge',
      'knowledge/domains',
      'knowledge/domains/_template',
      'history',
      '.am-tools'
    ]);

    const unexpectedFiles = [];
    fs_items.files.forEach(file => {
      if (!expectedFiles.has(file)) {
        // Allow README.md files in various places
        if (!file.endsWith('README.md')) {
          unexpectedFiles.push(file);
        }
      }
    });

    const unexpectedDirs = [];
    fs_items.dirs.forEach(dir => {
      if (!allowedDirs.has(dir)) {
        unexpectedDirs.push(dir);
      }
    });

    assert.strictEqual(unexpectedFiles.length, 0,
      `Unexpected files found: ${unexpectedFiles.join(', ')}`);
    assert.strictEqual(unexpectedDirs.length, 0,
      `Unexpected directories found: ${unexpectedDirs.join(', ')}`);
  });
});
