# Contributing to Agent Mind

Thank you for contributing! This guide explains how to develop, test, and extend agent-mind.

## Project Structure

```
agent-mind/
├── bin/
│   └── cli.js                 # CLI entry point
├── src/
│   ├── index.js              # Main export
│   ├── commands/
│   │   ├── init.js           # Initialize new agent-mind
│   │   └── upgrade.js        # Upgrade existing agent-mind
│   └── utils/
│       ├── template.js       # Template copy and variable replacement
│       ├── version.js        # Version management
│       └── ... other utils
├── template/                  # The agent-mind template structure
│   ├── BOOT.md               # Startup protocol
│   ├── config.md             # Project configuration
│   ├── protocols/            # Operating procedures
│   ├── knowledge/            # Learned patterns and insights
│   ├── history/              # Append-only task records
│   ├── adapters/             # Tool-specific integration guides
│   ├── workspace/            # In-progress work files
│   └── .am-tools/            # Helper scripts
├── tests/                     # Test suite
│   ├── structure.test.js     # Template structure validation
│   ├── references.test.js    # File reference validation
│   ├── sizes.test.js         # File size limit validation
│   ├── template.test.js      # Copy and substitution tests
│   ├── upgrade.test.js       # Upgrade logic tests
│   ├── tools.test.js         # Bash script tests
│   └── benchmarks/
│       └── protocol-adherence.test.js  # LLM protocol adherence benchmark
├── docs/                      # Documentation
│   ├── architecture.md       # Design and architecture
│   ├── research.md           # Research foundation
│   └── contributing.md       # This file
├── package.json              # NPM metadata
└── README.md                 # Package overview
```

## Setup

### Prerequisites
- Node.js 18 or later
- npm or yarn

### Install Dependencies
```bash
npm install
```

No external runtime dependencies — agent-mind uses only Node.js built-in modules.

### Local Development
```bash
# Make the CLI available locally
npm link

# Now you can use agent-mind in other directories
agent-mind init my-project
```

## Running Tests

### Run All Tests
```bash
npm test
# Runs: node --test tests/*.test.js
```

### Run Specific Test File
```bash
node --test tests/structure.test.js
node --test tests/template.test.js
```

### Run with Verbose Output
```bash
NODE_OPTIONS="--test-name-pattern=.*" npm test
```

### Optional: Protocol Adherence Benchmark
The benchmark in `tests/benchmarks/protocol-adherence.test.js` provides a methodology for testing LLM protocol adherence with an actual LLM. It's not automated by default (requires LLM API access).

To structure your own LLM benchmark:
1. Read `tests/benchmarks/protocol-adherence.test.js` for the framework
2. Define your task, expected workflow steps, and verification criteria
3. Run manually against your chosen LLM
4. Evaluate adherence using the provided metrics

## Modifying Template Files

The `template/` directory is the core of agent-mind. Changes here affect all new agent-minds initialized from the package.

### Guidelines
- Keep files under the stated size limits (see `tests/sizes.test.js`)
  - BOOT.md: <150 lines
  - config.md: <100 lines
  - protocol files: <200 lines
  - adapter files: <100 lines
- Use markdown only — no binary files or special formats
- Reference other files using backtick syntax: `` `path/to/file.md` ``
- Follow the existing structure — don't reorganize directories

### Testing Your Changes
```bash
# Run structure tests to ensure all required files exist
node --test tests/structure.test.js

# Run size tests to ensure files are under limits
node --test tests/sizes.test.js

# Run reference tests to ensure all file references are valid
node --test tests/references.test.js

# Run all tests
npm test
```

## Adding a New Adapter

To support a new LLM tool (e.g., new-code-editor):

1. Create `template/adapters/new-code-editor.md`
   - Explain how to read agent-mind from that tool
   - Document tool-specific integration points
   - Keep under 100 lines

2. Add it to `template/BOOT.md` in the Adapters section:
   ```markdown
   If you are New Code Editor, also read `.agent-mind/adapters/new-code-editor.md`.
   ```

3. Add it to `CORE_FILES` in `src/commands/upgrade.js`:
   ```javascript
   const CORE_FILES = [
     // ...existing files...
     'adapters/new-code-editor.md'
   ];
   ```

4. Test the upgrade logic:
   ```bash
   node --test tests/upgrade.test.js
   ```

## Adding a New Protocol

Custom workflows or procedures can be added as new protocol files:

1. Create `template/protocols/[name].md`
   - Explain the purpose and when to use it
   - Keep under 200 lines
   - Reference it from BOOT.md or from other protocols

2. Update `BOOT.md` to reference it if it's part of the main workflow

3. Add it to `CORE_FILES` in `src/commands/upgrade.js` if it's core system guidance

4. Test size limits:
   ```bash
   node --test tests/sizes.test.js
   ```

## Making Template Variables

If a template file needs user-defined values (like project name), use `{{VARIABLE}}` format:

```markdown
# Project: {{PROJECT_NAME}}
Description: {{PROJECT_DESCRIPTION}}
Created: {{DATE}}
```

These are replaced by `src/utils/template.js` when initialized. Variables are tested in `tests/template.test.js`.

## Pull Request Guidelines

1. **Run all tests** before submitting
   ```bash
   npm test
   ```

2. **Check file sizes** — all template files must pass size limits
   ```bash
   node --test tests/sizes.test.js
   ```

3. **Verify structure** — template must have all required files
   ```bash
   node --test tests/structure.test.js
   ```

4. **Test references** — all file references must be valid
   ```bash
   node --test tests/references.test.js
   ```

5. **Describe your changes** — explain what changed and why

6. **Keep PRs focused** — one feature or fix per PR

## Code Style

- Use JavaScript ES6+ with Node.js 18+ features
- Use const/let, not var
- No external npm dependencies (use Node.js built-ins only)
- Prefer explicit over clever
- Document non-obvious logic with comments

### Example
```javascript
const fs = require('fs');
const path = require('path');

/**
 * Clear a directory while preserving structure
 * @param {string} dirPath - Path to directory
 */
function clearDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath);
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      clearDirectory(fullPath);
      fs.rmdirSync(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  });
}
```

## Extending Agent Mind

Agent Mind is designed to be extended through markdown files, not code changes.

### Add Domain Knowledge
Users create `knowledge/domains/[name]/` with their own patterns and failures.

### Add Stack Knowledge
Users create `knowledge/stack/[tech].md` with tech-specific notes.

### Custom Protocols
Users can add `protocols/custom-[name].md` for project-specific workflows.

The code stays stable — the markdown grows and changes.

## Questions or Issues?

- Check the documentation in `docs/`
- Read `template/BOOT.md` for user-facing guidance
- Review test files for examples of how things should work
- Open an issue with questions about the design

## License

This project is licensed under MIT. By contributing, you agree that your contributions will be licensed under the same license.
