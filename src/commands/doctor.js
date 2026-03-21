const fs = require('fs');
const path = require('path');

/**
 * Count lines in a file
 */
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * Count entries in a file (lines starting with - or number)
 */
function countEntries(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    return lines.filter(line => /^\s*[-*\d]/.test(line)).length;
  } catch {
    return 0;
  }
}

/**
 * Find tags in a file
 */
function findTags(filePath, tag) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`\\[${tag}\\]`, 'g');
    const matches = content.match(regex);
    return (matches || []).length;
  } catch {
    return 0;
  }
}

/**
 * Check if directory structure is valid
 */
function validateStructure(agentMindPath) {
  const issues = [];
  const warnings = [];

  // Required directories
  const requiredDirs = [
    'workspace',
    'knowledge',
    'history',
    'protocols',
    'adapters',
    '.am-tools'
  ];

  requiredDirs.forEach(dir => {
    const dirPath = path.join(agentMindPath, dir);
    if (!fs.existsSync(dirPath)) {
      issues.push(`Missing directory: ${dir}`);
    }
  });

  // Required files
  const requiredFiles = [
    'BOOT.md',
    'VERSION.md',
    'config.md',
    'protocols/compaction.md',
    'protocols/maintenance.md',
    'protocols/workflow.md'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(agentMindPath, file);
    if (!fs.existsSync(filePath)) {
      issues.push(`Missing file: ${file}`);
    }
  });

  return { issues, warnings };
}

/**
 * Check file sizes against limits
 */
function checkFileSizes(agentMindPath) {
  const issues = [];
  const warnings = [];

  const limits = {
    'BOOT.md': 150,
    'protocols/compaction.md': 200,
    'protocols/maintenance.md': 200,
    'protocols/workflow.md': 200,
    'protocols/quality-gate.md': 200,
    'protocols/memory-ops.md': 200
  };

  Object.entries(limits).forEach(([file, limit]) => {
    const filePath = path.join(agentMindPath, file);
    if (fs.existsSync(filePath)) {
      const lines = countLines(filePath);
      if (lines > limit) {
        warnings.push(`${file} has ${lines} lines (limit: ${limit})`);
      }
    }
  });

  // Check knowledge domains
  const knowledgePath = path.join(agentMindPath, 'knowledge');
  if (fs.existsSync(knowledgePath)) {
    const domains = fs.readdirSync(knowledgePath);
    domains.forEach(domain => {
      const patternsPath = path.join(knowledgePath, domain, 'patterns.md');
      if (fs.existsSync(patternsPath)) {
        const lines = countLines(patternsPath);
        if (lines > 200) {
          warnings.push(`knowledge/${domain}/patterns.md has ${lines} lines (limit: 200)`);
        }
      }
    });
  }

  return { issues, warnings };
}

/**
 * Check for unverified content
 */
function checkUnverified(agentMindPath) {
  const issues = [];
  const warnings = [];
  let unverifiedCount = 0;

  function searchDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          searchDir(itemPath);
        } else if (item.endsWith('.md')) {
          const count = findTags(itemPath, 'UNVERIFIED');
          if (count > 0) {
            unverifiedCount += count;
          }
        }
      });
    } catch {
      // Ignore errors
    }
  }

  searchDir(agentMindPath);

  if (unverifiedCount > 0) {
    warnings.push(`Found ${unverifiedCount} [UNVERIFIED] entries - review and mark verified`);
  }

  return { issues, warnings };
}

/**
 * Count knowledge items
 */
function countKnowledge(agentMindPath) {
  let episodeCount = 0;
  let insightCount = 0;

  const historyPath = path.join(agentMindPath, 'history');
  if (fs.existsSync(historyPath)) {
    try {
      const episodes = fs.readdirSync(historyPath).filter(f => f.endsWith('.md'));
      episodeCount = episodes.length;
    } catch {
      // Ignore errors
    }
  }

  const insightsPath = path.join(agentMindPath, 'knowledge', 'insights.md');
  if (fs.existsSync(insightsPath)) {
    insightCount = countEntries(insightsPath);
  }

  return { episodeCount, insightCount };
}

async function doctor() {
  const cwd = process.cwd();
  const agentMindPath = path.join(cwd, '.agent-mind');

  console.log('\n🏥 Agent Mind Health Check\n');

  // Check if Agent Mind exists
  if (!fs.existsSync(agentMindPath)) {
    console.log('❌ Agent Mind not found in this directory.');
    console.log('Run "agent-mind init" to initialize it.\n');
    process.exit(1);
  }

  let totalIssues = 0;
  let totalWarnings = 0;

  // Validate structure
  console.log('📋 Checking directory structure...');
  const { issues: structIssues, warnings: structWarnings } = validateStructure(agentMindPath);
  if (structIssues.length > 0) {
    structIssues.forEach(issue => {
      console.log(`  ❌ ${issue}`);
      totalIssues++;
    });
  } else {
    console.log('  ✅ All required files and directories present');
  }

  // Check file sizes
  console.log('\n📏 Checking file sizes...');
  const { issues: sizeIssues, warnings: sizeWarnings } = checkFileSizes(agentMindPath);
  if (sizeWarnings.length > 0) {
    sizeWarnings.forEach(warning => {
      console.log(`  ⚠️  ${warning}`);
      totalWarnings++;
    });
  } else {
    console.log('  ✅ All files within size limits');
  }

  // Check for unverified content
  console.log('\n🔍 Checking for unverified content...');
  const { warnings: verifyWarnings } = checkUnverified(agentMindPath);
  if (verifyWarnings.length > 0) {
    verifyWarnings.forEach(warning => {
      console.log(`  ⚠️  ${warning}`);
      totalWarnings++;
    });
  } else {
    console.log('  ✅ No unverified entries found');
  }

  // Count knowledge items
  console.log('\n📚 Knowledge inventory...');
  const { episodeCount, insightCount } = countKnowledge(agentMindPath);
  console.log(`  • Episodes recorded: ${episodeCount}`);
  console.log(`  • Insights documented: ${insightCount}`);

  // Summary
  console.log('\n' + '='.repeat(50));
  if (totalIssues === 0 && totalWarnings === 0) {
    console.log('✅ Agent Mind is healthy!\n');
    process.exit(0);
  } else if (totalIssues === 0) {
    console.log(
      `⚠️  ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''} found (but no critical issues)\n`
    );
    process.exit(0);
  } else {
    console.log(`❌ ${totalIssues} critical issue${totalIssues !== 1 ? 's' : ''} found\n`);
    process.exit(1);
  }
}

module.exports = {
  doctor
};
