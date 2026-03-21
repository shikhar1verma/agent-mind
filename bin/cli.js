#!/usr/bin/env node

const path = require('path');
const { init } = require('../src/commands/init');
const { upgrade } = require('../src/commands/upgrade');
const { doctor } = require('../src/commands/doctor');
const { version, help } = require('../src/commands/meta');

const COMMANDS = {
  init,
  upgrade,
  doctor,
  version,
  help
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  if (COMMANDS[command]) {
    try {
      await COMMANDS[command](args.slice(1));
    } catch (error) {
      console.error(`\nError: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.error(`\nUnknown command: "${command}"\n`);
    console.log('Use "agent-mind help" to see available commands.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`\nFatal error: ${error.message}`);
  process.exit(1);
});
