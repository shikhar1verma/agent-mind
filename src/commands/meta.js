const { getPackageVersion } = require('../utils/version');

async function version() {
  const ver = getPackageVersion();
  console.log(`agent-mind ${ver}`);
}

async function help() {
  console.log(`
Agent Mind - Cognitive memory system for LLM agents

USAGE:
  agent-mind <command> [options]

COMMANDS:
  init      Initialize Agent Mind in your project
  upgrade   Upgrade Agent Mind to the latest version
  doctor    Check Agent Mind health and integrity
  version   Show Agent Mind version
  help      Show this help message

EXAMPLES:
  agent-mind init              # Start interactive setup
  agent-mind upgrade           # Update existing Agent Mind
  agent-mind doctor            # Check system health

Learn more at: https://github.com/shikhar1verma/agent-mind
`);
}

module.exports = {
  version,
  help
};
