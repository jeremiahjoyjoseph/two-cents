#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    process.exit(1);
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    process.exit(1);
  }
}

function updateVersion(newVersion) {
  console.log(`Updating version to ${newVersion}...`);

  // Update app.json
  const appJson = readJsonFile(APP_JSON_PATH);
  appJson.expo.version = newVersion;
  writeJsonFile(APP_JSON_PATH, appJson);
  console.log(`✓ Updated app.json version to ${newVersion}`);

  // Update package.json
  const packageJson = readJsonFile(PACKAGE_JSON_PATH);
  packageJson.version = newVersion;
  writeJsonFile(PACKAGE_JSON_PATH, packageJson);
  console.log(`✓ Updated package.json version to ${newVersion}`);

  console.log('\nVersion update complete!');
}

function getCurrentVersion() {
  const packageJson = readJsonFile(PACKAGE_JSON_PATH);
  return packageJson.version;
}

function bumpVersion(type = 'patch') {
  const currentVersion = getCurrentVersion();
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }

  updateVersion(newVersion);
}

function showHelp() {
  console.log(`
Version Management Script

Usage:
  node scripts/version.js <command> [options]

Commands:
  get                    Show current version
  set <version>          Set version to specific value (e.g., 1.2.3)
  bump [type]           Bump version (patch, minor, or major)
  help                   Show this help message

Examples:
  node scripts/version.js get
  node scripts/version.js set 1.2.3
  node scripts/version.js bump patch
  node scripts/version.js bump minor
  node scripts/version.js bump major
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'get':
      console.log(`Current version: ${getCurrentVersion()}`);
      break;
    case 'set':
      const version = args[1];
      if (!version) {
        console.error('Error: Version number required');
        process.exit(1);
      }
      updateVersion(version);
      break;
    case 'bump':
      const type = args[1] || 'patch';
      bumpVersion(type);
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error('Error: Unknown command');
      showHelp();
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  updateVersion,
  getCurrentVersion,
  bumpVersion,
};
