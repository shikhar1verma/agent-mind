const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

/**
 * Tests that all file path references in .md files are valid.
 * Parses backtick-quoted paths that look like relative references.
 */

const TEMPLATE_PATH = path.join(__dirname, '../template');

/**
 * Extract potential file references from markdown content.
 * Looks for patterns like: `path/to/file.md` or `path/to/dir/`
 * Excludes: code examples, command-line usage, and multi-line blocks
 */
function extractReferences(content) {
  const references = [];
  // Match backtick-quoted paths containing / (directory separators)
  const regex = /`([^`]*\/[^`]*)`/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const ref = match[1];

    // Skip if contains newlines (likely code block, not a reference)
    if (ref.includes('\n')) {
      continue;
    }

    // Skip if starts with bash/shell indicators (command usage)
    if (ref.startsWith('bash') || ref.startsWith('.')) {
      continue;
    }

    // Skip URLs
    if (ref.startsWith('http') || ref.startsWith('www')) {
      continue;
    }

    // Skip template placeholders like [task-slug]
    if (ref.includes('[') && ref.includes(']')) {
      continue;
    }

    // Only consider paths that end with .md or /
    if (ref.endsWith('.md') || ref.endsWith('/')) {
      references.push(ref);
    }
  }

  return references;
}

/**
 * Resolve a reference path relative to a markdown file's location,
 * with fallback to template root for root-relative references.
 */
function resolvePath(mdFilePath, referencePath, templatePath) {
  const mdDir = path.dirname(mdFilePath);
  // Handle references that start with ./
  const cleanRef = referencePath.startsWith('./') ? referencePath.slice(2) : referencePath;

  // Try resolving relative to file's directory first
  const relativePath = path.resolve(mdDir, cleanRef);
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }

  // Fall back to template root (for root-relative references)
  const rootPath = path.resolve(templatePath, cleanRef);
  return rootPath;
}

/**
 * Check if a reference is expected to exist in template.
 * Some references point to files that are created during workflow (not in template).
 */
function isExpectedInTemplate(refPath) {
  // Glob patterns with * are not literal file references
  if (refPath.includes('*')) {
    return false;
  }

  // References to home directory or system paths (~/) are external
  if (refPath.startsWith('~/')) {
    return false;
  }

  // References to workspace/ files don't exist yet (they're created by the agent)
  if (refPath.includes('/workspace/') || refPath.startsWith('workspace/')) {
    return false;
  }

  // References with template placeholders like [task-slug] or YYYY-MM are not literal files
  if ((refPath.includes('[') && refPath.includes(']')) || refPath.includes('YYYY-MM')) {
    return false;
  }

  // Relative references without directory context (just filename) are context-dependent
  // e.g., "failures/_index.md" from within a protocol file referring to domain-specific failures
  if (!refPath.includes('/') || (refPath.startsWith('failures/') && !refPath.includes('knowledge/'))) {
    return false;
  }

  // References to history files that haven't been created yet
  if (refPath.startsWith('history/') && (refPath.includes('YYYY-MM') || refPath.includes('[')) ) {
    return false;
  }

  // Everything else should exist in template
  return true;
}

/**
 * Collect all markdown files in the template
 */
function collectMarkdownFiles(dir, basePath = '') {
  const mdFiles = [];
  const entries = fs.readdirSync(dir);

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry);
    const relativePath = basePath ? `${basePath}/${entry}` : entry;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      mdFiles.push(...collectMarkdownFiles(fullPath, relativePath));
    } else if (entry.endsWith('.md')) {
      mdFiles.push(fullPath);
    }
  });

  return mdFiles;
}

describe('File References', () => {
  const mdFiles = collectMarkdownFiles(TEMPLATE_PATH);

  it(`found markdown files to validate (${mdFiles.length} files)`, () => {
    assert.ok(mdFiles.length > 0, 'should find at least one markdown file');
  });

  describe('Reference Validation', () => {
    mdFiles.forEach(mdFile => {
      const relPath = path.relative(TEMPLATE_PATH, mdFile);

      it(`${relPath} - all references are valid`, () => {
        const content = fs.readFileSync(mdFile, 'utf8');
        const references = extractReferences(content);

        const brokenRefs = [];

        references.forEach(ref => {
          // Skip expected non-template references
          if (!isExpectedInTemplate(ref)) {
            return;
          }

          const resolvedPath = resolvePath(mdFile, ref, TEMPLATE_PATH);

          // Check if the path exists (file or directory)
          if (!fs.existsSync(resolvedPath)) {
            brokenRefs.push({
              reference: ref,
              resolved: resolvedPath,
              note: 'does not exist'
            });
          }
        });

        assert.strictEqual(brokenRefs.length, 0,
          `Broken references found: ${JSON.stringify(brokenRefs, null, 2)}`);
      });
    });
  });

  it('summary: all references are valid', () => {
    const allReferences = {};
    let totalRefs = 0;
    let brokenCount = 0;

    mdFiles.forEach(mdFile => {
      const content = fs.readFileSync(mdFile, 'utf8');
      const references = extractReferences(content);

      references.forEach(ref => {
        // Skip expected non-template references
        if (!isExpectedInTemplate(ref)) {
          return;
        }

        totalRefs++;
        const resolvedPath = resolvePath(mdFile, ref, TEMPLATE_PATH);
        if (!fs.existsSync(resolvedPath)) {
          brokenCount++;
        }
      });
    });

    assert.strictEqual(brokenCount, 0,
      `Found ${brokenCount} broken references out of ${totalRefs} total references`);
  });
});
