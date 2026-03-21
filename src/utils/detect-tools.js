const fs = require('fs');
const path = require('path');

/**
 * Detect which LLM tool configuration files exist in the current directory
 * @param {string} [cwd=process.cwd()] - Directory to search
 * @returns {Array<{tool: string, path: string}>} - Detected tools with their config paths
 */
function detectTools(cwd = process.cwd()) {
  const detected = [];

  // Check for Claude Code
  const claudePath = path.join(cwd, 'CLAUDE.md');
  if (fs.existsSync(claudePath)) {
    detected.push({
      tool: 'Claude Code',
      path: claudePath,
      configFile: 'CLAUDE.md'
    });
  }

  // Check for Codex
  const agentsPath = path.join(cwd, 'AGENTS.md');
  if (fs.existsSync(agentsPath)) {
    detected.push({
      tool: 'Codex',
      path: agentsPath,
      configFile: 'AGENTS.md'
    });
  }

  // Check for Gemini CLI
  const geminiPath = path.join(cwd, 'GEMINI.md');
  if (fs.existsSync(geminiPath)) {
    detected.push({
      tool: 'Gemini CLI',
      path: geminiPath,
      configFile: 'GEMINI.md'
    });
  }

  // Check for Cursor
  const cursorRulesPath = path.join(cwd, '.cursorrules');
  const cursorRulesDirPath = path.join(cwd, '.cursor', 'rules');
  if (fs.existsSync(cursorRulesPath)) {
    detected.push({
      tool: 'Cursor',
      path: cursorRulesPath,
      configFile: '.cursorrules'
    });
  } else if (fs.existsSync(cursorRulesDirPath)) {
    detected.push({
      tool: 'Cursor',
      path: cursorRulesDirPath,
      configFile: '.cursor/rules/'
    });
  }

  return detected;
}

module.exports = detectTools;
