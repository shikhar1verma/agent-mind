const fs = require('fs');
const path = require('path');

/**
 * Get the path to the template directory
 * Resolves from the package root
 */
function getTemplatePath() {
  // From src/utils/template.js, go up to package root, then to template/
  return path.join(__dirname, '../../template');
}

/**
 * Copy template directory to target location, preserving structure
 * @param {string} targetDir - Destination directory path
 */
function copyTemplate(targetDir) {
  const templatePath = getTemplatePath();

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template directory not found at ${templatePath}`);
  }

  // Create target directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Recursively copy all files
  function copyDir(src, dest) {
    const items = fs.readdirSync(src);

    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  copyDir(templatePath, targetDir);
}

/**
 * Replace template variables in a file
 * Supports {{VAR}} format
 * @param {string} filePath - Path to file
 * @param {Object} variables - Key-value pairs for replacement
 */
function replaceVars(filePath, variables) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace each variable
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const regex = new RegExp(placeholder, 'g');
    content = content.replace(regex, String(value));
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Replace variables in all files in a directory (recursively)
 * @param {string} dirPath - Directory path
 * @param {Object} variables - Key-value pairs for replacement
 */
function replaceVarsInDir(dirPath, variables) {
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      replaceVarsInDir(fullPath, variables);
    } else if (stat.isFile()) {
      // Only process text files
      if (!['.png', '.jpg', '.jpeg', '.gif', '.zip', '.tar'].some(ext => item.endsWith(ext))) {
        try {
          replaceVars(fullPath, variables);
        } catch (error) {
          // Silently skip binary files
        }
      }
    }
  });
}

module.exports = {
  getTemplatePath,
  copyTemplate,
  replaceVars,
  replaceVarsInDir
};
