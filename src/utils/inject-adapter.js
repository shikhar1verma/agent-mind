const fs = require('fs');

const SNIPPET = `## Agent Mind Memory System
This project uses Agent Mind for structured memory management.
At the start of every session, read \`.agent-mind/BOOT.md\` and follow its protocols.
Use \`.agent-mind/workspace/\` as working memory for the current task.
After completing a task, follow \`.agent-mind/protocols/compaction.md\`.
When asked about memory health, follow \`.agent-mind/protocols/maintenance.md\`.`;

/**
 * Get the Agent Mind adapter snippet
 */
function getSnippet() {
  return SNIPPET;
}

/**
 * Check if the snippet is already present in the file
 * @param {string} filePath - Path to config file
 */
function hasSnippet(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('Agent Mind Memory System');
  } catch (error) {
    return false;
  }
}

/**
 * Inject the Agent Mind snippet into a tool config file
 * @param {string} filePath - Path to config file
 */
function injectSnippet(filePath) {
  try {
    if (hasSnippet(filePath)) {
      return {
        success: false,
        reason: 'already-present',
        message: 'Agent Mind snippet already present in file'
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content + '\n\n' + SNIPPET + '\n';
    fs.writeFileSync(filePath, newContent, 'utf8');

    return {
      success: true,
      message: 'Agent Mind snippet injected successfully'
    };
  } catch (error) {
    return {
      success: false,
      reason: 'write-error',
      message: `Failed to inject snippet: ${error.message}`
    };
  }
}

module.exports = {
  getSnippet,
  hasSnippet,
  injectSnippet
};
