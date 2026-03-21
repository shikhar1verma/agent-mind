const fs = require('fs');
const path = require('path');

/**
 * Get the package version from package.json
 */
function getPackageVersion() {
  const packageJsonPath = path.join(__dirname, '../../package.json');
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(content);
    return pkg.version;
  } catch (error) {
    throw new Error(`Failed to read package version: ${error.message}`);
  }
}

/**
 * Get the current Agent Mind version from .agent-mind/VERSION.md
 * @param {string} [agentMindDir='.agent-mind'] - Path to agent-mind directory
 */
function getCurrentVersion(agentMindDir = '.agent-mind') {
  const versionPath = path.join(agentMindDir, 'VERSION.md');

  if (!fs.existsSync(versionPath)) {
    throw new Error(`Agent Mind not initialized. Run "agent-mind init" first.`);
  }

  try {
    const content = fs.readFileSync(versionPath, 'utf8');
    // Parse version from lines like:
    // - "- **Installed version:** 1.0.0"
    // - "- **Installed version:** {{VERSION}}"
    let match = content.match(/Installed version:\*\*\s*{{VERSION}}/);
    if (match) {
      // Template hasn't been initialized yet - shouldn't reach here in normal flow
      throw new Error('Agent Mind template not initialized - run "agent-mind init"');
    }
    // Match semver pattern: X.Y.Z (the markdown may have ** before/after)
    match = content.match(/Installed version:\*\*\s*([0-9]+\.[0-9]+\.[0-9]+)/);
    if (match) {
      return match[1];
    }
    throw new Error('Version format not recognized in VERSION.md');
  } catch (error) {
    if (error.message.includes('Agent Mind template not initialized')) {
      throw error;
    }
    throw new Error(`Failed to read Agent Mind version: ${error.message}`);
  }
}

/**
 * Check if upgrade is needed
 * @param {string} [agentMindDir='.agent-mind'] - Path to agent-mind directory
 */
function needsUpgrade(agentMindDir = '.agent-mind') {
  try {
    const current = getCurrentVersion(agentMindDir);
    const pkg = getPackageVersion();
    return current !== pkg;
  } catch {
    return false;
  }
}

module.exports = {
  getPackageVersion,
  getCurrentVersion,
  needsUpgrade
};
