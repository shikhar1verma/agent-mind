const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const detectTools = require('../utils/detect-tools');
const { copyTemplate, replaceVarsInDir } = require('../utils/template');
const { injectSnippet, getSnippet, hasSnippet } = require('../utils/inject-adapter');

/**
 * Handle both TTY and piped stdin modes.
 *
 * TTY mode: Use readline.createInterface directly
 * Piped mode: Read all stdin lines upfront into a buffer, then consume them
 *
 * This fixes the issue where piped stdin loses data when multiple readline
 * interfaces are created/destroyed.
 */
let rl = null;
let isTTY = process.stdin.isTTY === true;
let pipeBuffer = [];
let pipeIndex = 0;

/**
 * Read all stdin lines into buffer (for piped mode only)
 */
function initPipeBuffer() {
  return new Promise((resolve) => {
    const lines = [];
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      const allLines = chunk.split('\n');
      allLines.forEach((line) => {
        if (line.length > 0) {
          lines.push(line);
        }
      });
    });

    process.stdin.on('end', () => {
      pipeBuffer = lines;
      pipeIndex = 0;
      resolve();
    });
  });
}

/**
 * Get next line from pipe buffer
 */
function getNextPipeLine() {
  if (pipeIndex < pipeBuffer.length) {
    return pipeBuffer[pipeIndex++];
  }
  return '';
}

/**
 * Create and return a shared readline interface (TTY mode only)
 */
function getRL() {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return rl;
}

function closeRL() {
  if (rl) {
    rl.close();
    rl = null;
  }
}

/**
 * Interactive prompt - handles both TTY and piped modes
 */
function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const displayQuestion = defaultValue
      ? `${question} [${defaultValue}]: `
      : `${question}: `;

    if (isTTY) {
      // TTY mode: use readline
      getRL().question(displayQuestion, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    } else {
      // Piped mode: get next line from buffer
      const answer = getNextPipeLine();
      resolve(answer.trim() || defaultValue);
    }
  });
}

/**
 * Confirm prompt - returns true/false
 */
function confirm(question) {
  return new Promise((resolve) => {
    const confirmQuestion = `${question} (y/n): `;

    if (isTTY) {
      // TTY mode: use readline
      getRL().question(confirmQuestion, (answer) => {
        resolve(
          answer.trim().toLowerCase() === 'y' ||
            answer.trim().toLowerCase() === 'yes'
        );
      });
    } else {
      // Piped mode: get next line from buffer
      const answer = getNextPipeLine();
      resolve(
        answer.trim().toLowerCase() === 'y' ||
          answer.trim().toLowerCase() === 'yes'
      );
    }
  });
}

/**
 * Select from multiple choice
 */
async function select(question, choices) {
  console.log(`\n${question}`);
  choices.forEach((choice, idx) => {
    console.log(`  ${idx + 1}. ${choice}`);
  });

  while (true) {
    const answer = await prompt('Select', '1');
    const idx = parseInt(answer, 10) - 1;
    if (idx >= 0 && idx < choices.length) {
      return choices[idx];
    }
    console.log('Invalid selection. Please try again.');
  }
}

/**
 * Make shell scripts executable
 */
function makeExecutable(dirPath) {
  try {
    const toolsDir = path.join(dirPath, '.am-tools');
    if (fs.existsSync(toolsDir)) {
      const files = fs.readdirSync(toolsDir);
      files.forEach((file) => {
        if (file.endsWith('.sh')) {
          const filePath = path.join(toolsDir, file);
          try {
            execSync(`chmod +x "${filePath}"`, { stdio: 'pipe' });
          } catch {
            // Silently fail — Windows doesn't support chmod
          }
        }
      });
    }
  } catch {
    // Silently handle errors
  }
}

/**
 * Parse comma-separated values into array
 */
function parseCommaList(str) {
  return str
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

async function init() {
  const cwd = process.cwd();
  const agentMindPath = path.join(cwd, '.agent-mind');

  console.log('\n🚀 Agent Mind Initialization\n');

  try {
    // Initialize pipe buffer if stdin is piped
    if (!isTTY) {
      await initPipeBuffer();
    }
    // Check if already exists
    if (fs.existsSync(agentMindPath)) {
      console.log('⚠️  Agent Mind is already initialized in this directory.\n');
      const shouldContinue = await confirm(
        'Continue anyway and reinitialize?'
      );
      if (!shouldContinue) {
        console.log('Initialization cancelled.');
        return;
      }
      console.log('Reinitializing...\n');
    }

    // Interactive questions
    const dirName = path.basename(cwd);
    const projectName = await prompt('Project name', dirName);
    const projectDescription = await prompt(
      'Brief project description (optional)',
      ''
    );

    const primaryTool = await select('Primary LLM tool?', [
      'Claude Code',
      'Codex',
      'Gemini CLI',
      'Cursor',
      'Other',
    ]);

    const domainsInput = await prompt(
      'Knowledge domains (comma-separated, optional)',
      ''
    );
    const domains = parseCommaList(domainsInput).join(', ');

    const stackInput = await prompt(
      'Key technologies (comma-separated, optional)',
      ''
    );
    const stack = parseCommaList(stackInput).join(', ');

    // Copy template
    console.log('\n📁 Creating Agent Mind structure...');
    try {
      copyTemplate(agentMindPath);
    } catch (error) {
      throw new Error(`Failed to copy template: ${error.message}`);
    }

    // Replace variables
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const variables = {
      PROJECT_NAME: projectName,
      PROJECT_DESCRIPTION: projectDescription || 'No description provided',
      DATE: dateStr,
      PRIMARY_AGENT: primaryTool,
      DOMAINS: domains || '(none yet — add as project evolves)',
      STACK: stack || '(none yet — add as needed)',
      VERSION: getPackageVersion(),
    };

    replaceVarsInDir(agentMindPath, variables);

    // Make scripts executable
    makeExecutable(agentMindPath);

    console.log('✅ Agent Mind structure created\n');

    // Detect and integrate with existing tools
    console.log('🔍 Checking for existing LLM tool configurations...\n');
    const detectedTools = detectTools(cwd);

    if (detectedTools.length > 0) {
      console.log(`Found ${detectedTools.length} tool configuration(s):\n`);

      for (const tool of detectedTools) {
        const shouldIntegrate = await confirm(
          `  Add Agent Mind integration to ${tool.tool} (${tool.configFile})?`
        );

        if (shouldIntegrate) {
          const result = injectSnippet(tool.path);
          if (result.success) {
            console.log(`  ✅ Integrated with ${tool.tool}\n`);
            console.log('  Added snippet:');
            console.log(
              getSnippet()
                .split('\n')
                .map((l) => '    ' + l)
                .join('\n')
            );
            console.log('');
          } else if (result.reason === 'already-present') {
            console.log(
              `  ℹ️  ${tool.tool} already has Agent Mind integration\n`
            );
          } else {
            console.log(`  ❌ Failed to integrate: ${result.message}\n`);
          }
        } else {
          console.log(`\n  Add this to your ${tool.configFile} manually:\n`);
          console.log('  ---');
          console.log(
            getSnippet()
              .split('\n')
              .map((l) => '  ' + l)
              .join('\n')
          );
          console.log('  ---\n');
        }
      }
    } else {
      console.log(
        'No existing LLM tool configs found. You can set up integration later.\n'
      );
      console.log('When ready, add this snippet to your tool config');
      console.log('(CLAUDE.md, AGENTS.md, GEMINI.md, or .cursorrules):\n');
      console.log(
        getSnippet()
          .split('\n')
          .map((l) => '  ' + l)
          .join('\n')
      );
      console.log('');
    }

    // Success message
    console.log('🎉 Agent Mind is ready!\n');
    console.log('Next steps:');
    console.log('  1. Your agent reads .agent-mind/BOOT.md at every session start');
    console.log('  2. Review .agent-mind/config.md to customize settings');
    console.log('  3. Run `agent-mind doctor` anytime to check memory health\n');
  } finally {
    closeRL();
  }
}

/**
 * Get package version
 */
function getPackageVersion() {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(content);
    return pkg.version;
  } catch {
    return '1.0.0';
  }
}

module.exports = {
  init,
};
