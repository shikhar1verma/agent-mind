const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { getPackageVersion, getCurrentVersion } = require('../utils/version');
const { copyTemplate, replaceVars } = require('../utils/template');

/**
 * Confirm prompt - returns true/false
 */
function confirm(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${question} (y/n): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * List of core files that should be updated (not user files)
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
 * Recursively copy core files only
 */
function copyOnlyCore(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  function isCoreFile(relativePath) {
    return CORE_FILES.some(core => {
      // Handle both exact matches and directory prefixes
      return relativePath === core || relativePath.startsWith(core + '/');
    });
  }

  function copyDirFiltered(src, dest, basePath = '') {
    const items = fs.readdirSync(src);

    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const relativePath = basePath ? `${basePath}/${item}` : item;
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        // Check if this directory contains core files
        if (isCoreFile(relativePath)) {
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
          }
          copyDirFiltered(srcPath, destPath, relativePath);
        }
      } else if (isCoreFile(relativePath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  copyDirFiltered(srcDir, destDir);
}

/**
 * Make shell scripts executable
 */
function makeExecutable(dirPath) {
  try {
    const toolsDir = path.join(dirPath, '.am-tools');
    if (fs.existsSync(toolsDir)) {
      const files = fs.readdirSync(toolsDir);
      files.forEach(file => {
        if (file.endsWith('.sh')) {
          const filePath = path.join(toolsDir, file);
          try {
            const { execSync } = require('child_process');
            execSync(`chmod +x "${filePath}"`, { stdio: 'pipe' });
          } catch {
            // Silently fail - Windows doesn't support chmod
          }
        }
      });
    }
  } catch (error) {
    // Silently handle errors
  }
}

async function upgrade() {
  const cwd = process.cwd();
  const agentMindPath = path.join(cwd, '.agent-mind');

  console.log('\n⬆️  Agent Mind Upgrade\n');

  // Check if Agent Mind exists
  if (!fs.existsSync(agentMindPath)) {
    throw new Error('Agent Mind not found. Run "agent-mind init" first.');
  }

  // Get versions
  const currentVersion = getCurrentVersion(agentMindPath);
  const packageVersion = getPackageVersion();

  console.log(`Current version: ${currentVersion}`);
  console.log(`Package version: ${packageVersion}\n`);

  if (currentVersion === packageVersion) {
    console.log('✅ Already up to date!');
    return;
  }

  // Show what will be updated
  console.log('Files that will be updated:');
  CORE_FILES.forEach(file => {
    console.log(`  • ${file}`);
  });
  console.log('\nNote: Your user files (config.md, knowledge/, workspace/, history/) are never touched.\n');

  // Ask for confirmation
  const shouldProceed = await confirm('Continue upgrade?');
  if (!shouldProceed) {
    console.log('Upgrade cancelled.');
    return;
  }

  // Perform upgrade
  console.log('\n📦 Upgrading...');

  const templatePath = path.join(__dirname, '../../template');
  if (!fs.existsSync(templatePath)) {
    throw new Error('Template directory not found');
  }

  // Copy only core files
  copyOnlyCore(templatePath, agentMindPath);

  // Update VERSION.md
  const versionPath = path.join(agentMindPath, 'VERSION.md');
  const now = new Date().toISOString().split('T')[0];

  replaceVars(versionPath, {
    VERSION: packageVersion,
    DATE: now
  });

  // Make scripts executable
  makeExecutable(agentMindPath);

  console.log(`✅ Upgraded to ${packageVersion}\n`);
  console.log('Updated files:');
  CORE_FILES.forEach(file => {
    console.log(`  ✓ ${file}`);
  });
  console.log('\nYour project data is safe and unchanged.\n');
}

module.exports = {
  upgrade
};
